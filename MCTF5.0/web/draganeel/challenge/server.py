"""
draganeel — server side.

Two pieces:

  1. The same XOR-rotate "hash" the WGSL runs, replicated in Python so
     the server can verify a player's submitted input sequence drives
     state[7] to GATE_VALUE.

  2. The hand-rolled cipher. Server encrypts each shed-scale byte the
     same way the WAT's `ankhseram_seal` function does — so a player
     who reverses the WAT can decrypt every scale frame and assemble
     GATE_VALUE.

Wire protocol:
  C → S  [2, soul7_LE_4bytes]                — request a scale
  C → S  [3, len_2bytes, inputs[1..len]]     — submit final sequence
  S → C  [1, idx, ct, nonce_lo, nonce_hi]    — encrypted scale frame
  S → C  [4, flag_len, flag_bytes...]        — flag (on verified gate)
  S → C  [5]                                 — wrong sequence

GATE_VALUE = first u32 of sha256(FLAG). The four scale bytes are the
LE bytes of GATE_VALUE.
"""
import asyncio, hashlib, os, struct, time
from aiohttp import web, WSMsgType


FLAG = open("/flag/flag.txt").read().strip()
GATE_VALUE = struct.unpack("<I", hashlib.sha256(FLAG.encode()).digest()[:4])[0]
GATE_BYTES = struct.pack("<I", GATE_VALUE)
INITIAL_SOUL = (0,) * 8


# ──────────────────────────────────────────────────────────────────
# death_predation — must match liber.wgsl exactly. Pure XOR + rotate.
# Every operation is GF(2)-linear, so the input → state[7] map is a
# linear function. That's the trapdoor.
# ──────────────────────────────────────────────────────────────────
def rotl(x, n): return ((x << n) | (x >> (32 - n))) & 0xFFFFFFFF

def death_predation(state, inputs):
    s = list(state)
    for i, x in enumerate(inputs):
        x &= 0xFFFFFFFF
        r0 = (i * 7  + 3)  & 31
        r1 = (i * 11 + 5)  & 31
        r2 = (i * 13 + 17) & 31
        s[0] ^= rotl(x, r0)
        s[1] ^= rotl(x, r1)
        s[2] ^= rotl(x, r2)
        s[7]  = rotl(s[7], 1) ^ s[0] ^ s[1] ^ rotl(s[2], 11)
    return s


# ──────────────────────────────────────────────────────────────────
# ankhseram_seal — must match liber.wat's exported function.
# 16-bit hand-rolled mix. Used only for scale-frame encryption.
# ──────────────────────────────────────────────────────────────────
def ankhseram_seal(nonce, idx):
    s = (nonce ^ ((idx * 0x9E37) & 0xFFFFFFFF)) & 0xFFFF
    s = (s * 0xCE6D) & 0xFFFF
    s = ((s << 7) | (s >> 9)) & 0xFFFF
    return s & 0xFF


def is_asleep():
    h = time.gmtime().tm_hour
    return False  # asleep gate disabled for the event


async def ws_handler(request):
    ws = web.WebSocketResponse(max_msg_size=8192)
    await ws.prepare(request)

    inputs_seen = []           # not used to drive hash; just for telemetry
    request_count = 0          # cycles idx 0..3 across requests

    async for msg in ws:
        if msg.type != WSMsgType.BINARY:
            if msg.type == WSMsgType.ERROR:
                break
            continue
        data = msg.data
        if not data:
            continue
        kind = data[0]

        # ─── kind 2: scale request ───────────────────────────────
        if kind == 2 and len(data) >= 5:
            soul7 = int.from_bytes(data[1:5], "little", signed=False)
            nonce16 = soul7 & 0xFFFF
            if is_asleep():
                # During the demon's sleeping hours, return random noise.
                # Players can detect this and try again later.
                idx = request_count & 3
                ct = os.urandom(1)[0]
            else:
                idx = request_count & 3
                ks = ankhseram_seal(nonce16, idx)
                ct = GATE_BYTES[idx] ^ ks
            await ws.send_bytes(bytes([1, idx, ct,
                                       nonce16 & 0xFF,
                                       (nonce16 >> 8) & 0xFF]))
            request_count += 1
            continue

        # ─── kind 3: death request ───────────────────────────────
        # Frame layout:
        #   [0]      = 3
        #   [1..3]   = input length (LE u16)
        #   [3..3+n] = wasd sequence (1 byte per input, in {0,1,2,3})
        #   [3+n..]  = curse token (LE u32) — the value the WAT VM
        #              accumulates in r12 by running its bytecode
        #              over the same input sequence. Without correctly
        #              executing the VM, the player can't produce this.
        if kind == 3 and len(data) >= 3:
            n = int.from_bytes(data[1:3], "little")
            if not (1 <= n <= 256) or len(data) < 3 + n + 4:
                await ws.send_bytes(bytes([5]))
                continue
            seq = list(data[3:3 + n])
            token = int.from_bytes(data[3 + n:3 + n + 4], "little")

            # Replay the WGSL hash on a fresh state.
            soul = death_predation(INITIAL_SOUL,
                                   [b & 0xFFFFFFFF for b in seq])
            # Replay the WAT VM curse-token computation:
            # r12 = XOR over i of ankhseram_seal(input_i, i)
            curse = 0
            for i, x in enumerate(seq):
                curse ^= ankhseram_seal(x, i)

            gate_ok  = (soul[7] & 0xFFFFFFFF) == GATE_VALUE
            curse_ok = (token & 0xFFFFFFFF) == curse
            if gate_ok and curse_ok:
                payload = FLAG.encode()
                await ws.send_bytes(
                    bytes([4, len(payload) & 0xFF]) + payload
                )
            else:
                await ws.send_bytes(bytes([5]))
            continue

    return ws


async def index(request):
    return web.FileResponse("/app/static/index.html")


async def static_handler(request):
    name = request.match_info["filename"]
    safe = os.path.normpath(name).lstrip("/")
    path = os.path.join("/app/static", safe)
    if not path.startswith("/app/static/") or not os.path.isfile(path):
        return web.Response(status=404)
    return web.FileResponse(path)


def main():
    app = web.Application()
    app.router.add_get("/", index)
    app.router.add_get("/ws", ws_handler)
    app.router.add_get("/{filename:.*}", static_handler)
    web.run_app(app, host="0.0.0.0", port=8080)


if __name__ == "__main__":
    main()
