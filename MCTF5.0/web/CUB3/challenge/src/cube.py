"""
Rubik's cube facelet model (v2: all 6 face moves).

Facelet layout (row-major, 3x3 per face):
  U: 0-8   (white)
  R: 9-17  (red)
  F: 18-26 (green)
  D: 27-35 (yellow)
  L: 36-44 (orange)
  B: 45-53 (blue)

Each face indexed as:
  0 1 2
  3 4 5
  6 7 8
viewed from outside the cube.

This layout matches the Kociemba two-phase solver's facelet convention,
so state strings from this module are directly usable with `kociemba`.
"""
import secrets


# Permutation cycles for each clockwise face turn (viewed from outside the face).
# Cycle (a, b, c, d) means the sticker at position a moves to position b,
# b -> c, c -> d, d -> a (see _apply_cycle below).
MOVES = {
    "U": [
        (0, 2, 8, 6), (1, 5, 7, 3),
        (18, 36, 45, 9), (19, 37, 46, 10), (20, 38, 47, 11),
    ],
    "D": [
        (27, 29, 35, 33), (28, 32, 34, 30),
        (24, 15, 51, 42), (25, 16, 52, 43), (26, 17, 53, 44),
    ],
    "L": [
        (36, 38, 44, 42), (37, 41, 43, 39),
        (0, 18, 27, 53), (3, 21, 30, 50), (6, 24, 33, 47),
    ],
    "R": [
        (9, 11, 17, 15), (10, 14, 16, 12),
        (2, 51, 29, 20), (5, 48, 32, 23), (8, 45, 35, 26),
    ],
    "F": [
        (18, 20, 26, 24), (19, 23, 25, 21),
        (6,  9, 29, 44), (7, 12, 28, 41), (8, 15, 27, 38),
    ],
    "B": [
        (45, 47, 53, 51), (46, 50, 52, 48),
        (0, 42, 35, 11), (1, 39, 34, 14), (2, 36, 33, 17),
    ],
}

FACES = ["U", "D", "L", "R", "F", "B"]
ALL_MOVES = [f + m for f in FACES for m in ("", "'")]  # 12 single-turn moves


def solved_state():
    return [i // 9 for i in range(54)]


def is_solved(state):
    for face in range(6):
        offset = face * 9
        c = state[offset + 4]
        for i in range(9):
            if state[offset + i] != c:
                return False
    return True


def _apply_cycle(state, cycle):
    vals = [state[i] for i in cycle]
    n = len(cycle)
    for i in range(n):
        state[cycle[i]] = vals[(i - 1) % n]


def apply_move(state, move):
    state = list(state)
    face = move[0]
    mod = move[1:] if len(move) > 1 else ""

    if face not in MOVES:
        raise ValueError(f"Unknown move: {move!r}")

    if mod == "":
        repeats = 1
    elif mod == "'":
        repeats = 3  # three CW turns = one CCW turn
    elif mod == "2":
        repeats = 2
    else:
        raise ValueError(f"Unknown modifier in move: {move!r}")

    cycles = MOVES[face]
    for _ in range(repeats):
        for cyc in cycles:
            _apply_cycle(state, cyc)
    return state


def apply_sequence(state, sequence):
    for m in sequence:
        state = apply_move(state, m)
    return state


def inverse_move(move):
    face = move[0]
    mod = move[1:] if len(move) > 1 else ""
    if mod == "":
        return face + "'"
    if mod == "'":
        return face
    if mod == "2":
        return move
    raise ValueError(f"Unknown move: {move!r}")


def inverse_sequence(sequence):
    return [inverse_move(m) for m in reversed(sequence)]


def generate_scramble(length=25):
    """Cryptographically secure scramble using all six faces."""
    result = []
    last_face = None
    for _ in range(length):
        while True:
            m = secrets.choice(ALL_MOVES)
            if m[0] != last_face:
                break
        result.append(m)
        last_face = m[0]
    return result


# Conversion helpers for interoperating with standard solvers (Kociemba etc.)
# Our state is a list of ints 0..5 mapping to U, R, F, D, L, B in that order
# (because i//9 with our layout gives 0 for U, 1 for R, 2 for F, 3 for D, 4 for L, 5 for B).
_INT_TO_COLOR = "URFDLB"


def state_to_string(state):
    """Return the 54-character facelet string used by kociemba."""
    return "".join(_INT_TO_COLOR[c] for c in state)


def string_to_state(s):
    """Parse a 54-character facelet string back into a state list."""
    if len(s) != 54:
        raise ValueError("facelet string must be 54 chars")
    lookup = {c: i for i, c in enumerate(_INT_TO_COLOR)}
    return [lookup[c] for c in s]


# ----------------------------------------------------------------------
# Keystroke alphabet used by the UI.
#
# Players never see standard cube notation. They submit a string of letters,
# one per quarter-turn, drawn from this alphabet:
#
#   q/w  : upper layer   left / right   ->  U  / U'
#   a/s  : bottom layer  left / right   ->  D' / D
#   e/d  : left column   up   / down    ->  L' / L
#   r/f  : right column  up   / down    ->  R  / R'
#   t/g  : front face    cw   / ccw     ->  F  / F'
#   y/h  : back face     cw   / ccw     ->  B  / B'
#
# Doubles like U2 become two presses (q q). Letters are case-insensitive.
# ----------------------------------------------------------------------
LETTER_TO_MOVE = {
    "q": "U",  "w": "U'",
    "a": "D'", "s": "D",
    "e": "L'", "d": "L",
    "r": "R",  "f": "R'",
    "t": "F",  "g": "F'",
    "y": "B",  "h": "B'",
}

MOVE_TO_LETTER = {v: k for k, v in LETTER_TO_MOVE.items()}

LETTER_ALPHABET = set(LETTER_TO_MOVE)


def letters_to_moves(letters):
    """Convert a keystroke string (any whitespace ignored, case-insensitive)
    to a list of quarter-turn moves. Raises ValueError on any unknown char."""
    moves = []
    for ch in letters:
        if ch.isspace():
            continue
        c = ch.lower()
        if c not in LETTER_TO_MOVE:
            raise ValueError(f"illegal keystroke: {ch!r}")
        moves.append(LETTER_TO_MOVE[c])
    return moves


def moves_to_letters(moves):
    """Convert a list of moves (incl. U2-style doubles) to a keystroke string.
    Used by the example solver to convert Kociemba output to UI form."""
    out = []
    for m in moves:
        if m.endswith("2"):
            base = m[0]
            out.append(MOVE_TO_LETTER[base] * 2)
        else:
            out.append(MOVE_TO_LETTER[m])
    return "".join(out)
