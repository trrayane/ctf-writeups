"""
CTF backend for the Rubik's Cube challenge (v3).

Differences from v2:
 * The submit endpoint takes a KEYSTROKE STRING (letters q,w,a,s,e,d,r,f,
   t,g,y,h) instead of a move array. Standard cube notation (U, U', ...)
   is never exposed to the client.
 * Each scramble session issues a short-lived submit-token ("CSRF" in the
   loose sense: bound to the session, required by /api/submit). This is
   UX, not anti-automation -- an attacker with a scriptable HTTP client
   can always fetch and replay the token, as with any server-issued token.
   Its purpose is to bind submit calls to a specific scramble session and
   to document the normal UI flow.

Flow:
  POST /api/scramble  -> {session_id, state, submit_token, timer_seconds}
  POST /api/submit    -> body: {session_id, submit_token, solution: "qwasd..."}
                         validates server-side; returns the flag on success.
"""
import os
import time
import secrets
from threading import Lock

from flask import Flask, jsonify, request, send_from_directory

from cube import (
    solved_state,
    is_solved,
    apply_sequence,
    generate_scramble,
    letters_to_moves,
    LETTER_ALPHABET,
)

app = Flask(__name__, static_folder=None)

# ---- configuration ----
FLAG = os.environ.get("CTF_FLAG", "mctf{k3y5tr0k35_b4tt13_w0n_1n_m1111s3c0nd55555}")
TIMER_SECONDS = float(os.environ.get("CTF_TIMER", "10"))
SCRAMBLE_LENGTH = int(os.environ.get("CTF_SCRAMBLE_LEN", "25"))
MAX_SOLUTION_LENGTH = 500  # letter count, pre-parse

# ---- in-memory session store ----
_sessions = {}
_sessions_lock = Lock()


def _purge_old_sessions():
    cutoff = time.time() - 300
    with _sessions_lock:
        stale = [sid for sid, s in _sessions.items() if s["start_time"] < cutoff]
        for sid in stale:
            del _sessions[sid]


@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/api/scramble", methods=["POST"])
def scramble():
    _purge_old_sessions()
    seq = generate_scramble(SCRAMBLE_LENGTH)
    state = apply_sequence(solved_state(), seq)
    sid = secrets.token_urlsafe(32)
    token = secrets.token_urlsafe(24)
    with _sessions_lock:
        _sessions[sid] = {
            "scramble": seq,
            "submit_token": token,
            "start_time": time.time(),
            "used": False,
        }
    return jsonify({
        "session_id": sid,
        "submit_token": token,
        "state": state,
        "timer_seconds": TIMER_SECONDS,
        "server_time": time.time(),
    })


@app.route("/api/submit", methods=["POST"])
def submit():
    data = request.get_json(silent=True) or {}
    sid = data.get("session_id")
    token = data.get("submit_token")
    solution = data.get("solution", "")

    if not isinstance(sid, str) or not isinstance(token, str) or not isinstance(solution, str):
        return jsonify({"success": False, "error": "Malformed request."}), 400

    if len(solution) > MAX_SOLUTION_LENGTH:
        return jsonify({"success": False, "error": "Solution too long."}), 400

    # Parse the keystroke string into moves. Any stray character is an error.
    try:
        moves = letters_to_moves(solution)
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400

    with _sessions_lock:
        sess = _sessions.get(sid)
        if sess is None:
            return jsonify({"success": False, "error": "Unknown session."}), 400
        # Constant-time token compare to avoid timing oracle on session store.
        if not secrets.compare_digest(sess["submit_token"], token):
            return jsonify({"success": False, "error": "Bad submit token."}), 400
        if sess["used"]:
            return jsonify({"success": False, "error": "Session already consumed."}), 400
        sess["used"] = True
        elapsed = time.time() - sess["start_time"]
        scramble_seq = sess["scramble"]

    if elapsed > TIMER_SECONDS:
        return jsonify({
            "success": False,
            "error": "Time expired.",
            "elapsed": round(elapsed, 3),
        })

    state = apply_sequence(solved_state(), scramble_seq)
    state = apply_sequence(state, moves)

    if is_solved(state):
        return jsonify({
            "success": True,
            "flag": FLAG,
            "elapsed": round(elapsed, 3),
            "moves_used": len(moves),
        })

    return jsonify({
        "success": False,
        "error": "Cube is not in the solved state.",
        "elapsed": round(elapsed, 3),
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8000")), debug=False)
