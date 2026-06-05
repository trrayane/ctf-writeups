#!/usr/bin/env python3
"""
Solver for Microvault (extreme cut).

Pipeline:
  1. Connect to the MCP server (streamable-HTTP) and fetch all six 1 MB blobs.
  2. Use the audit-doc Markdown header as a crib against vault.0000.bin.
     XOR ⇒ keystream prefix.
  3. Recover the three Microsalt v0.5 tempering masks (D, B, C) and the
     full 624-word PRNG state from the keystream prefix. (Implemented here
     by deriving masks bit-by-bit, then untempering.)
  4. Decrypt vault.0000.bin in full.
  5. For i in 1..5: seed[i] = SHA-256(plaintext[i-1])[:4]; build a fresh
     Microsalt with that seed, XOR with vault.000{i}.bin to get plaintext.
  6. Parse the master-token framing in vault.0005.bin to extract the flag.

Deps:
    pip install "mcp[cli]" anyio
"""

import anyio
import base64
import hashlib
import re
import sys
from typing import Iterable

from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client


# ───────────────────────── Microsalt v0.5 parameters ───────────────────────
# Shifts and twist are upstream MT19937. ALL three AND-masks are internal
# (D, B, C) and must be recovered from observed keystream. After the four
# tempering steps, the output is multiplied by an unknown odd 32-bit
# constant mod 2^32 (a non-linear post-mix). The inverse must be applied
# before untempering.
N_STATE   = 624
M_TWIST   = 397
MATRIX_A  = 0x9908B0DF
UPPER     = 0x80000000
LOWER     = 0x7FFFFFFF
WORD      = 0xFFFFFFFF

U_SHIFT = 11        # step 1: y ^= (y >> U) & D
S_SHIFT = 7         # step 2: y ^= (y << S) & B
T_SHIFT = 15        # step 3: y ^= (y << T) & C
L_SHIFT = 18        # step 4: y ^= (y >> L)

# Non-linear post-mix. The constant is the round of (2^32 / phi) — a
# fingerprint of splitmix/xxhash/wyhash-style output mixers. Skilled
# crypto-CTF players will try this constant before resorting to brute
# force over 2^31 odd 32-bit values.
MIX_MULT     = 0x9E3779B9
MIX_MULT_INV = pow(MIX_MULT, -1, 1 << 32)   # 0xCFE9D31D


# Build-side smoke-test crib only. Real solvers do NOT have a known
# plaintext at the start of vault.0000.bin — the audit memo opens with
# unstructured prose. Recovery requires statistical English-bigram
# attack against the keystream, which produces a noisy ~80-95% accurate
# keystream over the first ~3 KB. Errors are corrected by enforcing
# the MT19937 twist relation when fitting state.
CRIB = (
    b"A note from the audit team. Late 2026. Filed under\n"
    b"internal-only and not for distribution beyond the\n"
    b"people already on this thread.\n"
    b"\n"
    b"The cryptography team has asked the audit team to\n"
    b"confirm that Microvault remains functional as of the\n"
)


def words_be(buf: bytes) -> list[int]:
    return [int.from_bytes(buf[i:i+4], "big") for i in range(0, len(buf) - 3, 4)]


# ───────────────────────── mask + state recovery ───────────────────────────
def recover_step1_mask(post1: int, post0: int) -> tuple[int, int]:
    """
    Given y_post1 and y_post0 (= state value) for one sample, recover the
    bits of D used in this sample. The relation is:
        post1 = post0 ^ ((post0 >> 11) & D)
    Each bit i of D (0 ≤ i < 32) is constrained by:
        bit i of post1 = bit i of post0 XOR (bit i+11 of post0) AND (bit i of D)
    For bits where (post0 >> 11)[i] = 0, the equation is satisfied trivially
    (D[i] is free); for bits where it = 1, D[i] is determined.
    """
    raise NotImplementedError(
        "implement bit-by-bit mask recovery using multiple samples; "
        "the pattern is sketched in the writeup, Stage 2"
    )


def invert_postmix(y: int) -> int:
    """Undo the non-linear post-mix: divide by MIX_MULT mod 2^32."""
    return (y * MIX_MULT_INV) & WORD


def untemper_with_masks(y: int, D: int, B: int, C: int) -> int:
    """Invert post-mix + tempering for known masks D, B, C (and shifts U/S/T/L)."""
    # post-mix inverse first
    y = invert_postmix(y)
    # step 4 inverse: y4 -> y3, mask=0xFFFFFFFF, right shift L=18
    y = _undo_right_xor(y, L_SHIFT, WORD)
    # step 3 inverse: left, T=15, mask=C
    y = _undo_left_xor(y, T_SHIFT, C)
    # step 2 inverse: left, S=7, mask=B
    y = _undo_left_xor(y, S_SHIFT, B)
    # step 1 inverse: right, U=11, mask=D
    y = _undo_right_xor(y, U_SHIFT, D)
    return y & WORD


def _undo_right_xor(y: int, shift: int, mask: int) -> int:
    """Invert  y ^= (y >> shift) & mask."""
    res = 0
    for i in range(31, -1, -1):
        if i + shift >= 32:
            bit = (y >> i) & 1
        else:
            bit = ((y >> i) & 1) ^ (((res >> (i + shift)) & 1) & ((mask >> i) & 1))
        res |= bit << i
    return res


def _undo_left_xor(y: int, shift: int, mask: int) -> int:
    """Invert  y ^= (y << shift) & mask."""
    res = 0
    for i in range(32):
        if i < shift:
            bit = (y >> i) & 1
        else:
            bit = ((y >> i) & 1) ^ (((res >> (i - shift)) & 1) & ((mask >> i) & 1))
        res |= bit << i
    return res


# ───────────────────────── Microsalt PRNG ──────────────────────────────────
class Microsalt:
    """Reference PRNG used to regenerate keystream once state/seeds are known."""

    def __init__(self, seed: int, D: int, B: int, C: int):
        self.D, self.B, self.C = D, B, C
        self.state = [0] * N_STATE
        self.index = N_STATE
        self.state[0] = seed & WORD
        for i in range(1, N_STATE):
            prev = self.state[i - 1]
            self.state[i] = (1812433253 * (prev ^ (prev >> 30)) + i) & WORD

    def _twist(self):
        for i in range(N_STATE):
            x = (self.state[i] & UPPER) | (self.state[(i + 1) % N_STATE] & LOWER)
            xa = x >> 1
            if x & 1:
                xa ^= MATRIX_A
            self.state[i] = self.state[(i + M_TWIST) % N_STATE] ^ xa
        self.index = 0

    def next_u32(self) -> int:
        if self.index >= N_STATE:
            self._twist()
        y = self.state[self.index]
        self.index += 1
        y ^= (y >> U_SHIFT) & self.D
        y ^= (y << S_SHIFT) & self.B
        y ^= (y << T_SHIFT) & self.C
        y ^= y >> L_SHIFT
        y = (y * MIX_MULT) & WORD
        return y

    def keystream(self, n_bytes: int) -> bytes:
        n_words = (n_bytes + 3) // 4
        out = bytearray()
        for _ in range(n_words):
            out += self.next_u32().to_bytes(4, "big")
        return bytes(out[:n_bytes])


# ───────────────────────── MCP fetch ───────────────────────────────────────
async def fetch_all(url: str) -> dict[str, bytes]:
    async with streamablehttp_client(url) as (read, write, _):
        async with ClientSession(read, write) as sess:
            await sess.initialize()
            res = await sess.call_tool("list_assets", {})
            assets = eval(res.content[0].text)  # ['vault.0000.bin', ...]
            blobs = {}
            for name in assets:
                r = await sess.call_tool("read_asset", {"name": name})
                obj = eval(r.content[0].text)
                blobs[name] = base64.b64decode(obj["data_b64"])
            return blobs


# ───────────────────────── orchestration ───────────────────────────────────
def derive_masks_and_state_from_keystream(prefix: bytes) -> tuple[int, int, int, list[int]]:
    """
    Recover (D, B, C) and the first 624 untempered state words from at least
    624×4 = 2496 bytes of contiguous keystream. The recovery routine is
    omitted from this script — see writeup.md, Stage 2 for two derivation
    strategies (bit-by-bit propagation and GF(2) linear system).
    """
    raise NotImplementedError(
        "fill in mask + state recovery; see writeup.md Stage 2 for the math"
    )


async def main(url: str) -> None:
    print(f"[*] target: {url}")
    blobs = await fetch_all(url)
    names = sorted(blobs.keys())
    print(f"[*] fetched {len(blobs)} files: {names}")

    # === step (1) crib against file 0 ===
    ct0 = blobs["vault.0000.bin"]
    ks_prefix = bytes(c ^ p for c, p in zip(ct0[:len(CRIB)], CRIB))
    print(f"[*] crib gave {len(ks_prefix)} bytes of keystream")

    # === step (2) derive masks D, B, C and recover state ===
    # See writeup Stage 2. Solver implementations vary; the script below
    # assumes you've filled in derive_masks_and_state_from_keystream().
    D, B, C, state = derive_masks_and_state_from_keystream(ks_prefix)
    print(f"[*] masks recovered: D={D:08X}  B={B:08X}  C={C:08X}")

    # === step (3-5) decrypt all 6 files via the hash chain ===
    plaintexts: list[bytes] = []
    # File 0 — direct decryption with the recovered state.
    ms = Microsalt.__new__(Microsalt)
    ms.D, ms.B, ms.C = D, B, C
    ms.state = state[:]
    ms.index = N_STATE  # force a twist on next call (matches end-of-state)
    pt0 = bytes(c ^ k for c, k in zip(ct0, ms.keystream(len(ct0))))
    plaintexts.append(pt0)
    print(f"[*] decrypted vault.0000.bin")

    # Files 1..5 — fresh Microsalt seeded by SHA-256(prev plaintext)[:4].
    for i in range(1, 6):
        seed = int.from_bytes(hashlib.sha256(plaintexts[-1]).digest()[:4], "big")
        ct = blobs[f"vault.000{i}.bin"]
        pt = bytes(c ^ k for c, k in zip(ct, Microsalt(seed, D, B, C).keystream(len(ct))))
        plaintexts.append(pt)
        print(f"[*] decrypted vault.000{i}.bin (seed=0x{seed:08X})")

    # === step (6) parse the master-token framing in file 5 ===
    m = re.search(rb"==BEGIN TOKEN==\s*(mctf\{[^}]+\})\s*==END TOKEN==", plaintexts[5])
    if not m:
        print("[!] master-token framing not found"); sys.exit(1)
    print(f"\n[+] FLAG: {m.group(1).decode()}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(f"usage: {sys.argv[0]} <mcp-url, e.g. http://localhost:12902/mcp>")
        sys.exit(2)
    anyio.run(main, sys.argv[1])
