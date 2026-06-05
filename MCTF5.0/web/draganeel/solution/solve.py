#!/usr/bin/env python3
"""
draganeel — reference solver.

Given the host URL, captures enough WS frames to recover GATE_VALUE,
solves the GF(2) linear system for the 28-keystroke wasd sequence,
and submits the death request to retrieve the flag.

Requires: pip install websockets numpy

Usage: python3 solve.py [https://draganeel.mctf.microclub.info]
"""
import asyncio, struct, sys
import numpy as np
import websockets

URL = sys.argv[1] if len(sys.argv) > 1 else "https://draganeel.mctf.microclub.info"
WS_URL = URL.replace("https://", "wss://").replace("http://", "ws://") + "/ws"

N = 28


# ──────────────────────────────────────────────────────────────────
# Trapdoor #1 — WGSL hash, replicated in pure Python
# ──────────────────────────────────────────────────────────────────
def rotl(x, n): return ((x << n) | (x >> (32 - n))) & 0xFFFFFFFF


def f7(inputs):
    s = [0] * 8
    for i, x in enumerate(inputs):
        x &= 0xFFFFFFFF
        r0 = (i * 7  + 3)  & 31
        r1 = (i * 11 + 5)  & 31
        r2 = (i * 13 + 17) & 31
        s[0] ^= rotl(x, r0)
        s[1] ^= rotl(x, r1)
        s[2] ^= rotl(x, r2)
        s[7]  = rotl(s[7], 1) ^ s[0] ^ s[1] ^ rotl(s[2], 11)
    return s[7]


# ──────────────────────────────────────────────────────────────────
# Trapdoor #2 — extracted from liber.wasm: ankhseram_seal
# ──────────────────────────────────────────────────────────────────
def ankhseram_seal(nonce, idx):
    s = (nonce ^ ((idx * 0x9E37) & 0xFFFFFFFF)) & 0xFFFF
    s = (s * 0xCE6D) & 0xFFFF
    s = ((s << 7) | (s >> 9)) & 0xFFFF
    return s & 0xFF


def solve_inputs_for_gate(target):
    """Build the GF(2) matrix and solve for the 28-keystroke sequence."""
    rows = []
    for inp_idx in range(N):
        for b in range(2):                 # wasd has 2 bits per input
            inputs = [0] * N
            inputs[inp_idx] = 1 << b
            row = f7(inputs)
            rows.append([(row >> ob) & 1 for ob in range(32)])
    M = np.array(rows, dtype=np.int8).T     # 32 × 2N
    rhs = np.array([(target >> i) & 1 for i in range(32)], dtype=np.int8)
    A = np.hstack([M, rhs.reshape(-1, 1)]).astype(np.int8)
    r, c = A.shape
    pivots = []
    row = 0
    for col in range(c - 1):
        if row >= r: break
        piv = None
        for i in range(row, r):
            if A[i, col] == 1: piv = i; break
        if piv is None: continue
        A[[row, piv]] = A[[piv, row]]
        for i in range(r):
            if i != row and A[i, col] == 1: A[i] ^= A[row]
        pivots.append(col); row += 1
    for i in range(row, r):
        if A[i, c - 1] == 1: return None
    x = np.zeros(c - 1, dtype=np.int8)
    for i, pcol in enumerate(pivots): x[pcol] = A[i, c - 1]
    return [int(x[2 * i]) | (int(x[2 * i + 1]) << 1) for i in range(N)]


async def play():
    print(f"[*] connecting to {WS_URL}")
    async with websockets.connect(WS_URL, max_size=None) as ws:
        # Phase 1: recover GATE_VALUE by capturing scale frames.
        # We don't need to drive soul[7] anywhere specific — the server
        # cycles idx 0..3 across requests, and we know how to compute the
        # keystream from (nonce, idx) directly.
        gate = [None, None, None, None]
        round_n = 0
        while None in gate:
            round_n += 1
            soul7 = round_n * 0x12345  # any value, as long as nonce16 varies
            await ws.send(bytes([2]) + (soul7 & 0xFFFFFFFF).to_bytes(4, "little"))
            frame = await ws.recv()
            if frame[0] != 1: continue
            idx = frame[1]
            ct = frame[2]
            nonce16 = frame[3] | (frame[4] << 8)
            ks = ankhseram_seal(nonce16, idx)
            byte = ct ^ ks
            if gate[idx] is None:
                gate[idx] = byte
                print(f"[*] scale[{idx}] = 0x{byte:02x} from nonce 0x{nonce16:04x}")
            if round_n > 200 and None in gate:
                # likely time-of-day asleep mode (random ciphertext)
                print("[!] gate not converging — server may be asleep (03-09 UTC). retry later.")
                return

        gate_value = struct.unpack("<I", bytes(gate))[0]
        print(f"[+] GATE_VALUE = 0x{gate_value:08x}")

        # Phase 2: linear-solve for the 28-input sequence.
        seq = solve_inputs_for_gate(gate_value)
        if seq is None:
            print("[!] system unsolvable for this GATE — should never happen, abort")
            return
        print(f"[+] computed wasd sequence: {seq}")

        # Phase 3: compute the curse token from the WAT VM bytecode.
        # The VM accumulates r12 = XOR over i of ankhseram_seal(input_i, i).
        # Without including this token, the death-request is rejected.
        curse = 0
        for i, x in enumerate(seq):
            curse ^= ankhseram_seal(x, i)
        print(f"[+] curse token = 0x{curse:08x}")

        # Phase 4: submit (inputs + curse token).
        body = (bytes([3, len(seq) & 0xFF, (len(seq) >> 8) & 0xFF])
                + bytes(seq)
                + curse.to_bytes(4, "little"))
        await ws.send(body)
        reply = await ws.recv()
        if reply[0] == 4:
            length = reply[1]
            flag = reply[2:2 + length].decode()
            print(f"[★] flag = {flag}")
        else:
            print(f"[!] server rejected: kind={reply[0]}")


if __name__ == "__main__":
    asyncio.run(play())
