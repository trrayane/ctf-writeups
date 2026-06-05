# Microvault — deployment notes

## Build artefacts

`docker compose build` runs `src/build/encrypt.py` once at image-build time. That step:

- Reads plaintexts from `src/plaintexts/`.
- Generates the master-token plaintext from the `FLAG` constant in `encrypt.py`.
- Encrypts each plaintext under a fresh Microsalt v0.5 instance, chained by `SHA-256(plaintext[i])[:4]`.
- Writes 6 × 1 MB blobs (`vault.0000.bin` … `vault.0005.bin`) plus `manifest.txt` to `/app/out/` inside the image.

The MCP server (`src/server/server.py`) reads the same `manifest.txt` at startup and exposes `list_assets` and `read_asset`. There is no `whoami()` tool — cipher disclosure is intentionally absent.

## Runtime

- Single Python container.
- Streamable-HTTP MCP transport on port `8080` inside the container; mapped to `12902` outside.
- Public URL through Traefik: `https://microvault.mctf.microclub.info/mcp`.

## Difficulty rework (current cut: extreme-extreme)

Promoted from **medium → extreme**. Compounding changes from the v0.4 baseline:

1. **All three tempering AND-masks are internal** (v0.4 modified only one). Public MT19937 untemper does not work as a drop-in. Solvers must derive `(BASE_D, BASE_B, BASE_C)` algebraically from observed keystream.
2. **Non-linear post-mix.** Tempered output is multiplied by `0x9E3779B9` mod 2^32 (the golden-ratio mixer used in splitmix/xxhash/wyhash). Bijective but not GF(2)-linear; linear state-recovery attacks fail before they start unless the post-mix is inverted first.
3. **No predictable crib.** The audit memo opens with naturalistic prose. Solvers must run a statistical English-bigram attack and self-correct against the MT19937 twist relation.
4. **Per-file plaintext-chained reseeding.** Each file uses a fresh Microsalt with `seed[i+1] = SHA-256(plaintext[i])[0:4]`. No replay-forward shortcut.
5. **Per-file mask perturbation.** Every file's masks are `BASE ^ SHA-256(prev_plaintext)[16:28]`. Solvers derive the base masks once from file 0's crib, then must recompute perturbed masks for each subsequent file.
6. **Cipher metadata fully stripped.** Removed `whoami()` from the MCP server. Removed `microsalt_whitepaper.txt` from the plaintexts. Filenames in storage are opaque (`vault.NNNN.bin`).
7. **Sophisticated multi-trap.** Four prompt-injection decoys across files 0/1/2/4 in varied framings (Python stack trace, runbook notice, compliance attestation, YAML config sample) — no overt "automation directive" labels.
8. **Hash-anchored multi-candidate flag in file 5.** File 5's plaintext contains eight `==BEGIN TOKEN== / ==END TOKEN==` candidates in identical framing; only the candidate whose SHA-256 matches the integrity record in file 4 is the real flag. Solvers must (a) decrypt file 4 fully to find the validation hash, (b) compute SHA-256 over every file-5 candidate, (c) submit the matching one.

### Soften it for the event

The challenge has multiple difficulty knobs. From "tap" to "rollback":

- **Tap (~5% easier):** restore a Markdown header to the audit memo (`internal_audit_2026.txt`) so a fixed crib is available again. Rebuild.
- **Soft (~10% easier):** drop the per-file mask perturbation (in `encrypt.py`, set `next_masks = (BASE_D, BASE_B, BASE_C)` regardless of `prev_plaintext`). Solvers derive masks once and reuse for every file.
- **Soft+ (~10% easier):** drop the multi-candidate framing in file 5 (one `==BEGIN TOKEN==` block only). Solvers don't need to compute and match SHA-256.
- **Soft++ (~30% easier):** drop the post-mix step (delete the `y = (y * MIX_MULT) & WORD_MASK` line in `microsalt.py`). Linear state recovery works directly on the keystream.
- **Soft+++ (~50% easier):** also revert step 1 of the tempering schedule by setting `D = 0xFFFFFFFF` in `microsalt.py`. Public MT19937 untemper code works on step 1, leaving only `(B, C)` to recover.
- **Full rollback to medium:** revert the changes above plus undo per-file reseeding. Restore `whoami()` if you want the cipher spec disclosed.

## Secret rotation between events

| File | Field | Note |
|---|---|---|
| `challenge/src/build/encrypt.py` | `MASTER_SEED` | Seed for file 0. Change → all six ciphertexts change. |
| `challenge/src/build/encrypt.py` | `FLAG` | Plaintext flag string. |
| `challenge/src/build/microsalt.py` | `D`, `B`, `C` | Tempering masks. Each is a 32-bit constant. Change → ciphertexts change. |
| `challenge/src/build/microsalt.py` | `MIX_MULT` | Non-linear post-mix constant (must be odd). Default `0x9E3779B9` is recognisable to crypto-CTF players from splitmix/xxhash. Change → ciphertexts change. |
| `challenge/challenge.yml` and outer `challenge.yml` | flag entry | Keep in sync with `FLAG`. |
| `challenge/src/build/encrypt.py` | `TRAPS` (each `mctf{...}` string) | Bait flags planted across files. Optional to rotate, but worth refreshing per event. |

## Test the build locally

```bash
cd challenge/src
OUT_DIR=/tmp/mv-out python3 build/encrypt.py
ls /tmp/mv-out/   # should list 6× vault.NNNN.bin + manifest.txt
```

## Known gotchas

- Plaintext sources contain non-ASCII characters (em dashes, etc.). The build pipeline reads them as raw bytes, so this is fine, but keep in mind when editing source `.txt` files.
- `member_roster_q4.bin` is binary; keep it short (< 1 MB) so the filler block fits before `FILE_SIZE`.
- Don't add a public-facing static asset that mentions the words *Microsalt*, *MT19937*, or *AND-mask*. The challenge depends on the cipher being unobservable from documentation.
