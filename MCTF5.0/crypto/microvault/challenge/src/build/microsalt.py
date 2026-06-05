"""
Microsalt v0.5 — internal stream cipher used by Microvault.

The cipher is a Mersenne-twister-shaped PRNG used as a one-time pad
generator. State recurrence and shift amounts are upstream MT19937,
but every AND-mask in the output tempering schedule has been replaced
by an internal constant. The masks are not published; recovering them
is necessary to invert the tempering and predict subsequent output.

The seeding schedule is also upstream-compatible (1812433253-multiplier
init), but each encrypted file uses a freshly seeded instance — see
encrypt.py for the seed-chaining rule.
"""

# ─── parameters ─────────────────────────────────────────────────────────────
W = 32
N_STATE = 624
M_TWIST = 397
R = 31
MATRIX_A = 0x9908B0DF

# Tempering: shifts upstream-compatible; ALL masks replaced.
#
# upstream MT19937:                         microsalt v0.5:
#   y ^= (y >> 11)                            y ^= (y >> 11) & 0x6BE53A1F
#   y ^= (y <<  7) & 0x9D2C5680               y ^= (y <<  7) & 0xC3D7BE5A
#   y ^= (y << 15) & 0xEFC60000               y ^= (y << 15) & 0x82D147A0
#   y ^= (y >> 18)                            y ^= (y >> 18)
#
# Step 1 in upstream uses an effective mask of 0xFFFFFFFF (no AND).
# v0.5 introduces a real mask there too.
U, D = 11, 0x6BE53A1F
S, B = 7,  0xC3D7BE5A
T, C = 15, 0x82D147A0
L     = 18

# Non-linear post-mix. After the four tempering steps, multiply the
# 32-bit output by an odd constant mod 2^32. Multiplication by odd is
# bijective mod 2^k (it admits a modular inverse computable via the
# extended Euclidean algorithm), but is *not* a GF(2)-linear operation
# (carries make it non-linear bit-wise). This breaks any state-recovery
# attack that treats the keystream as a linear function of state.
#
# The constant 0x9E3779B9 is the integer round of (2^32 / phi); it
# appears in splitmix, xxhash, wyhash, and many other hash mixers.
MIX_MULT     = 0x9E3779B9
MIX_MULT_INV = pow(MIX_MULT, -1, 1 << 32)   # 0xCFE9D31D — used by inverters

LOWER_MASK = (1 << R) - 1
UPPER_MASK = (~LOWER_MASK) & 0xFFFFFFFF
WORD_MASK  = 0xFFFFFFFF


class Microsalt:
    """Microsalt v0.5 PRNG. Big-endian byte order on serialisation.

    Masks (D, B, C) are per-instance: each encrypted artefact perturbs
    the base masks with material derived from the previous artefact's
    plaintext, so every Microsalt instance in the chain runs a slightly
    different tempering schedule. Solvers derive the base masks once
    (from a crib in file 0) and must recompute the per-file perturbation
    for each subsequent file.
    """

    VERSION = "v0.5"

    def __init__(self, seed: int, mask_d: int = D, mask_b: int = B, mask_c: int = C):
        self.D = mask_d & WORD_MASK
        self.B = mask_b & WORD_MASK
        self.C = mask_c & WORD_MASK
        self.state = [0] * N_STATE
        self.index = N_STATE
        self.state[0] = seed & WORD_MASK
        for i in range(1, N_STATE):
            prev = self.state[i - 1]
            self.state[i] = (1812433253 * (prev ^ (prev >> 30)) + i) & WORD_MASK

    def _twist(self):
        for i in range(N_STATE):
            x = (self.state[i] & UPPER_MASK) | (self.state[(i + 1) % N_STATE] & LOWER_MASK)
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
        # tempering — every mask is internal, perturbed per-instance
        y ^= (y >> U) & self.D
        y ^= (y << S) & self.B
        y ^= (y << T) & self.C
        y ^= y >> L
        # non-linear post-mix
        y = (y * MIX_MULT) & WORD_MASK
        return y

    def keystream(self, n_bytes: int) -> bytes:
        n_words = (n_bytes + 3) // 4
        out = bytearray()
        for _ in range(n_words):
            out += self.next_u32().to_bytes(4, "big")
        return bytes(out[:n_bytes])
