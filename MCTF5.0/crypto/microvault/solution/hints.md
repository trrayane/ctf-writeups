# Microvault — Hints

### 1 · Don't paste blobs

Six × 1 MB base64 — way past any LLM's context window. Pull the files to disk and work locally.

### 2 · The keystream is non-linear

The output is MT19937-shaped underneath, but every word goes through a final non-linear mix that linear state-recovery can't see through. You need to invert that mix before any untemper will work.

### 3 · The constant is famous

There is exactly one 32-bit odd constant a serious crypto person would try first. It's the 32-bit round of `2^32 / φ`. It appears in splitmix, xxhash, wyhash, and approximately every other output mixer ever published. Try it.

### 4 · Three masks, not one

Even after the post-mix is inverted, the three tempering AND-masks are all internal. Public MT19937 untemper code is wrong in three places. Derive the masks bit-by-bit, or set up a GF(2) system across 624 outputs + 96 mask bits.

### 5 · The masks are NOT constant across files

Each file's masks are perturbed by `SHA-256(prev_plaintext)`. You derive the *base* masks from file 0's crib, but for every subsequent file you must recompute the per-file perturbation from the previous plaintext. Bytes 16-28 of the SHA-256 hash carry the perturbation.

### 6 · No header crib this time

The first file is a memo written in unstructured prose. No fixed Markdown header, no template. You have to recover keystream by statistical English attack — guess high-frequency words and bigrams, refine — and self-correct against the MT19937 twist relation.

### 7 · You can't jump to the last file

Each file uses a fresh Microsalt instance keyed off the previous plaintext. You must decrypt in order.

### 8 · The flag isn't the first one you see

There are several `mctf{...}` strings hidden across the decrypted files. Most are framed as stack traces, runbook notices, compliance attestations, and YAML config samples — they look like normal documentation, not automation bait, but they are bait.

### 9 · The real flag is identified by a SHA-256 match

File 5 contains eight `==BEGIN TOKEN== / ==END TOKEN==` candidates with identical framing. File 4's plaintext contains a "Master-token integrity record" line with the SHA-256 of the live token. Hash each of the eight candidates; the match is the flag.
