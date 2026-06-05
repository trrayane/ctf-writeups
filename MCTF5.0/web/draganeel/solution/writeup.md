# draganeel — writeup

## Surface

A tome. Press Enter, four-key game (`wasd`), die in seconds. Tab to "die". Z.'s briefing email is the spec: *"to kill what i made, you must let it kill you. the name is in the dying."*

The flag is the demon's true name. It only emerges when you submit the *exact* 28-keystroke sequence that drives the WGSL hash output to a server-side gate value. Brute force is `4^28 ≈ 7.2 × 10¹⁶` — out. You have to crack two trapdoors, then assemble.

## Trapdoor #1 — the WGSL hash is GF(2)-linear

`liber.wgsl` runs an 8-word state under a tight loop. Read the operations:

```wgsl
s[0] ^= rotl(x, r0);
s[1] ^= rotl(x, r1);
s[2] ^= rotl(x, r2);
s[7]  = rotl(s[7], 1u) ^ s[0] ^ s[1] ^ rotl(s[2], 11u);
```

**Every operation is XOR or rotate.** No `+`. No `*`. No `if`. The function is therefore linear over GF(2): `state[7]` is a fixed linear combination of input bits. That's the trapdoor.

Build the bit-matrix:

```
M[i][j] = bit i of f7([input_j_bit_set])
```

with rows = 32 (output bits), cols = N×2 (input bits, since wasd is 2-bit). At N=28 the rank reaches the full 32. Solve `M · x = GATE` over GF(2) → the unique 28-keystroke sequence.

## Trapdoor #2 — the cipher is in the WAT

The server encrypts each shed-scale frame's plaintext byte with a hand-rolled cipher: `ct = byte ⊕ ks(nonce, idx)`. To recover GATE_VALUE you need `ks`. The server source isn't shipped. The cipher is, though — **inside `liber.wasm`**.

`liber.wasm` exports three functions named after Zeref's curses:

- `iced_shell(x)` — looks like an LCG step (decoy)
- `fairy_glitter(a, b)` — looks like a Feistel half-round (decoy)
- `ankhseram_seal(nonce, idx)` — the actual cipher

Two ways to identify the real one:

1. **Read the WAT** (`wasm2wat`). `ankhseram_seal` matches the math:
   ```
   s = (nonce ^ (idx * 0x9E37)) & 0xFFFF
   s = (s * 0xCE6D) & 0xFFFF
   s = ((s << 7) | (s >> 9)) & 0xFFFF
   return s & 0xFF
   ```
2. **Black-box it.** Capture WS frames; compute `byte_candidate = ct ⊕ fn(nonce, idx)` for each of the three; the one that yields stable byte values per `idx` (across many frames) is the cipher.

Apply the cipher to four frames spanning idx 0..3 → recover `GATE_BYTES[0..3]` → assemble `GATE_VALUE = u32_le(...)`.

## Solve, end-to-end

1. Open the tome, press Enter → game starts.
2. Press `wasd` keys; observe WS frames in DevTools network tab (binary).
3. Pull `liber.wasm` and `liber.wgsl`. Open both.
4. Spot the linearity in WGSL → set up the bit-matrix `M`.
5. Reverse `liber.wasm` → recognise `ankhseram_seal` is the cipher.
6. Capture ≥4 distinct-`idx` scale frames from the WS log → decrypt each → assemble the 4-byte `GATE_VALUE`.
7. Solve `M · x = GATE` over GF(2) → 28 input values in {0,1,2,3} (= w,a,s,d).
8. Press the 28 keys. Press **Tab**. Server replays the hash, verifies, returns `[4, flag_len, flag_bytes]`. Canvas paints the flag in burning orange.

## Anti-AI moats encountered

- **Hand-written WAT** with three competing decoy functions: an LLM that reads each in isolation can't tell which is the cipher without behavioural matching against captured wire frames.
- **WGSL is sparse in training data**; the linearity is in front of you but easy to miss if you assume it's a hash because it has 8 state words.
- **Visual exfil** of the flag: the server emits raw bytes only after gate-replay-verification; the canvas burning-paper render makes screenshot OCR brittle for headless agents.
- **Recon misdirection**: the WAT VM runs decorative Fibonacci bytecode and updates a "curse counter" on the canvas; spending hours interpreting it teaches you nothing about the protocol.
- **Time-of-day gate**: 03–09 UTC the server returns random noise instead of real ciphertexts. Round-the-clock agents waste runtime.
- **Tab key**: the death-request must come from a real keyboard event; CDP-driven WS without Tab gets nowhere.

## Flag

```
mctf{ETHER10U5_N4T5U_DR4GN33L}
```

## Estimated solve time

Top human team: 8–14 hours.
LLM-assisted human: 5–8 hours (the linearity hint accelerates step 4–5).
Pure-LLM agent without human: stuck at step 5 — won't reliably distinguish the cipher among the three decoy exports without running the WASM and matching against wire traffic, which the agent's tool stack rarely supports cleanly.
