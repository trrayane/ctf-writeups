# draganeel — design notes (for the author)

This is the MVP. The mechanic and inversion work end-to-end; deepen any of these to reach full extreme:

## Anti-AI moats — depth status

| moat | mvp | full |
|---|---|---|
| hand-WAT VM | ✓ small | grow to 200+ functions, decoys, hand-mangled CFG |
| custom opcodes | ✓ 9 ops | 32+ ops, calling-convention via shared mem |
| WGSL hash with weakness | ✓ rotation-degeneracy | tighter trapdoor (boomerang differential, related-key) |
| bytecode XOR | ✓ const key | derive at runtime from `GPUAdapter.requestAdapterInfo()` |
| AES-CTR small-nonce | ✓ 16-bit | 32-bit + lazier collision rate; longer game |
| anti-debug timing | stub | real `performance.now()` jitter check inside dispatch |
| anti-emulation | stub | reject swiftshader / lavapipe via vendor string |
| visual exfil | plain canvas text in MVP | "burning paper" fragment shader, low-res, animated |
| audio steganography | not present | 1 bit of gate hidden in OGG phase loop |
| polyglot WASM-as-PNG | not present | bit-engineered file is valid as both; PNG shows Zeref portrait |
| time-of-day gate | ✓ 03–09 UTC degraded | also pause spawn during those hours? operator-side |
| misdirection / decoys | minimal | flood static/ with `flag.txt`, `secret.bin`, etc. all red herrings |

## Story polish

Keep Z.'s voice terse, lowercase, fragmented. Possible motifs to weave in if you do a "hint package" later:
- ankhseram seal motifs in the sigil ASCII
- the spell names `iced_shell`, `fairy_glitter`, `death_predation` referenced in WAT — reuse in WS frame metadata as decoys
- a single line of Latin rendered in the CSS `@font-face` URL fragment that names the demon

## Build

```
cd challenge/
docker build -t draganeel .
docker run --rm -p 12903:8080 draganeel
```

Open `http://localhost:12903`. Press Enter. Press wasd until the canvas paints.

## Validator

Standard MCTF validator covers it — `bun .github/scripts/validation/src/cli/index.ts validate-one ./challenges/web/draganeel`.

## Known MVP shortcuts

- `loader.js` does the gate-check on plain `out[7] === gateValue` *in JS*. In production the gate must live inside the WASM (already wired via the bytecode `jcond` op + reg8) and the JS must NOT know `gateValue` until the server has surrendered all four scales.
- Solver scaffold in `solution/solve.py` is a sketch — real solver needs the WGSL inversion implemented.
- The flag is currently revealed by drawing text on canvas in the true-death animation. Replace with the "burning paper" fragment shader so OCR is harder.
