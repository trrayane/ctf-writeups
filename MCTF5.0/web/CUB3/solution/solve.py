#!/usr/bin/env python3
"""
Example solver for the Rubik's Cube CTF challenge (v3).

v3 changes what the client submits: a KEYSTROKE STRING over the alphabet
{q,w,a,s,e,d,r,f,t,g,y,h} rather than cube notation. The server translates
letters to moves internally. Submits also require a server-issued token
from /api/scramble.

Install:
    pip install kociemba

Usage:
    python3 solve.py [URL]
    python3 solve.py http://localhost:5000
"""
import sys
import time
import json
import urllib.request

try:
    import kociemba
except ImportError:
    sys.exit("This solver requires `kociemba`. Install with: pip install kociemba")

DEFAULT_URL = "http://localhost:5000"

# Must match cube.py _INT_TO_COLOR order (U,R,F,D,L,B).
_INT_TO_COLOR = "URFDLB"

# Must match cube.py LETTER_TO_MOVE.
MOVE_TO_LETTER = {
    "U":  "q", "U'": "w",
    "D'": "a", "D":  "s",
    "L'": "e", "L":  "d",
    "R":  "r", "R'": "f",
    "F":  "t", "F'": "g",
    "B":  "y", "B'": "h",
}


def state_to_string(state):
    return "".join(_INT_TO_COLOR[c] for c in state)


def moves_to_letters(moves_tokens):
    """Convert Kociemba's output tokens (U, U', U2, ...) to a letter string.
    Doubles are expanded to two presses."""
    out = []
    for tok in moves_tokens:
        if tok.endswith("2"):
            out.append(MOVE_TO_LETTER[tok[0]] * 2)
        else:
            out.append(MOVE_TO_LETTER[tok])
    return "".join(out)


def post_json(url, payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def solve(base_url: str):
    t0 = time.time()

    # 1. Fetch the scrambled state + submit token.
    resp = post_json(f"{base_url}/api/scramble", {})
    session_id   = resp["session_id"]
    submit_token = resp["submit_token"]
    state        = resp["state"]

    facelet_str = state_to_string(state)
    print(f"[+] Got state: {facelet_str}")
    print(f"[+] Session:   {session_id}")
    print(f"[+] Timer:     {resp['timer_seconds']}s")

    # 2. Solve with Kociemba (returns cube notation).
    t_solve = time.time()
    sol_notation = kociemba.solve(facelet_str)
    t_solve = time.time() - t_solve
    tokens = sol_notation.split()
    print(f"[+] Kociemba solved in {t_solve*1000:.1f}ms: {sol_notation}")

    # 3. Translate to the keystroke alphabet the server expects.
    letters = moves_to_letters(tokens)
    print(f"[+] Keystrokes ({len(letters)} chars): {letters}")

    # 4. Submit.
    result = post_json(
        f"{base_url}/api/submit",
        {
            "session_id": session_id,
            "submit_token": submit_token,
            "solution": letters,
        },
    )

    elapsed = time.time() - t0
    print(f"[+] Total round-trip: {elapsed*1000:.1f}ms")
    print(f"[+] Server response: {json.dumps(result, indent=2)}")

    if result.get("success"):
        print(f"\n[!] FLAG: {result.get('flag')}")
        return 0
    print("\n[-] Solve failed.")
    return 1


if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_URL
    sys.exit(solve(url.rstrip("/")))
