# Microvault

**Category:** crypto · **Difficulty:** extreme · **Author:** Zeref
**Flag:** `mctf{n0_specs_n0_h1nts_just_pure_4lg3br4_4nd_h45h_ch41ns}`

Six 1 MB blobs over MCP under opaque names (`vault.0000.bin` … `vault.0005.bin`). No `whoami()`, no whitepaper, no fixed crib in any plaintext, no obvious prompt-injection framing. Cipher is **Microsalt v0.5** — MT19937-shaped PRNG with three internal AND-masks, a non-linear post-mix (`× 0x9E3779B9 mod 2^32`), and **per-file mask perturbation**: every encrypted artefact runs a slightly different tempering schedule. Files chain through plaintext-derived material:

```
seed[i+1]   = SHA-256(plaintext[i])[0:4]   (big-endian u32)
masks[i+1]  = (BASE_D ^ h[16:20], BASE_B ^ h[20:24], BASE_C ^ h[24:28])
```

The flag in file 5 is **one of eight** identically-framed `==BEGIN TOKEN== / ==END TOKEN==` candidates; only the candidate whose UTF-8 SHA-256 matches a hash documented inside file 4 is real.

## Stage 0 — Recon

```python
list_assets()  # → ['vault.0000.bin', ..., 'vault.0005.bin']
```

## Stage 1 — Identify cipher class + post-mix

(See previous-cycle writeup for fundamentals — this section is unchanged.)

The keystream is MT19937-shaped underneath but linear state recovery on the raw keystream fails. After the four tempering steps, every output word is multiplied by an unknown odd 32-bit constant mod 2^32. Multiplication by odd is bijective but non-linear over GF(2). The constant is `0x9E3779B9` (golden-ratio mixer fingerprint — splitmix/xxhash). Modular inverse: `0xCFE9D31D`.

## Stage 2 — Recover base masks (one-time)

The audit memo (file 0, identifiable by content via partial decryption) opens with naturalistic prose. Two viable approaches:

- **English-bigram attack**: guess high-frequency English in the post-mix-inverted keystream, refine by bigram statistics, lift ~85-95% accurate keystream prefix.
- **Self-correcting via the MT19937 twist relation**: the noisy keystream + the linear twist recurrence + the unknown-mask GF(2) system are over-determined; correct values for `(BASE_D, BASE_B, BASE_C)` and underlying state pop out simultaneously.

Recovered base masks (this build):

```
BASE_D = 0x6BE53A1F
BASE_B = 0xC3D7BE5A
BASE_C = 0x82D147A0
```

These are the file 0 masks. **Files 1-5 use perturbed masks** — see Stage 4.

## Stage 3 — Decrypt file 0

Generate file 0's keystream from the recovered state, XOR with `vault.0000.bin`. Plaintext is the audit memo. Read it carefully — a planted trap appears at offset ~600,000 styled as a Python stack trace whose embedded "fixture default" is a fake mctf flag. Don't submit it.

## Stage 4 — Walk the chain with mask perturbation

For each `i` in 0..5, after recovering `plaintext[i]`:

```python
h = SHA-256(plaintext[i])
seed_next  = int.from_bytes(h[0:4],   "big")
masks_next = (BASE_D ^ int.from_bytes(h[16:20], "big"),
              BASE_B ^ int.from_bytes(h[20:24], "big"),
              BASE_C ^ int.from_bytes(h[24:28], "big"))
```

Build a fresh Microsalt with `(seed_next, masks_next)`, generate 1 MB of keystream, XOR with `vault.000{i+1}.bin`. The post-mix constant `0x9E3779B9` and shifts stay constant; only the masks (and seed) rotate.

Files 1, 2, 4 each plant a fake-flag trap in different framings (runbook notice, compliance-attestation, sample-config block). All bait.

## Stage 5 — Find the validation hash in file 4

File 4's plaintext (`infra notes`) contains a section titled "Master-token integrity record" with a line:

```
expected SHA-256 (hex): a41e3db8f502f75c2e3042fa4ea6faf65ac67e8b08c3bb1c22ef078f6a3a7a26
```

This is the SHA-256 of the real flag's UTF-8 bytes (no surrounding whitespace).

## Stage 6 — Disambiguate file 5's eight candidates

File 5's plaintext contains **eight** `==BEGIN TOKEN== / ==END TOKEN==` blocks, ordered by a deterministic shuffle. SHA-256 each candidate's UTF-8 bytes; the one matching the file-4 hash is the live flag.

```python
import re, hashlib
expected = "a41e3db8f502f75c2e3042fa4ea6faf65ac67e8b08c3bb1c22ef078f6a3a7a26"
for c in re.findall(rb"==BEGIN TOKEN==\s*(mctf\{[^}]+\})\s*==END TOKEN==", plaintext_5):
    if hashlib.sha256(c).hexdigest() == expected:
        print("FLAG:", c.decode()); break
# FLAG: mctf{n0_specs_n0_h1nts_just_pure_4lg3br4_4nd_h45h_ch41ns}
```

Submit that one.

## Why this is "extreme" and AI-resistant

- **No spec disclosure.** No whoami, no whitepaper, no filenames hinting at content.
- **Three unknown 32-bit base masks + per-file mask perturbation.** Public MT19937 untemper code is wrong on three steps simultaneously, AND the masks rotate across files — solvers must derive base masks once and recompute perturbed masks from each previous plaintext for every subsequent file.
- **Non-linear post-mix.** Multiplication by `0x9E3779B9` mod 2^32 — bijective but not GF(2)-linear, so any linear-only state-recovery attack fails before it starts.
- **No fixed-header crib.** The audit memo opens with unstructured prose. Solvers must run a statistical English attack and self-correct against the MT19937 twist relation.
- **Plaintext-chained reseeding + mask perturbation.** No replay-forward shortcut. Files must be decrypted in order; every step's keystream depends on the previous plaintext in full.
- **Sophisticated traps.** Four planted decoys across files 0/1/2/4, each in a different framing (Python stack trace, runbook notice, compliance attestation, YAML sample config). None carry overt automation labels — heuristics that key on "automation directive" framings will not flag them.
- **Eight candidates in file 5.** Identical framing; only the candidate whose SHA-256 matches the integrity record in file 4 is real. AI agents that grep for `mctf{...}` and submit the first hit pick a fake; agents that grep for the BEGIN/END framing also pick a fake; agents that submit the first decrypted plaintext also lose. Solvers must read file 4 carefully *and* compute SHA-256 over each file-5 candidate.
- **Volume.** Six × 1 MB blobs — far past any LLM's in-context window.
