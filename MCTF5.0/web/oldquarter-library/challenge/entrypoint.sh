#!/bin/bash
set -e

# -----------------------------------------------------------------------------
# Directories
# -----------------------------------------------------------------------------
mkdir -p /var/lib/library /flags

# -----------------------------------------------------------------------------
# Seed catalogue DB (one-shot, as www-data so the file is owned correctly)
# -----------------------------------------------------------------------------
chown www-data:www-data /var/lib/library
su -s /bin/bash -c "LIBRARY_DB=/var/lib/library/library.db python3 /app/code/seed.py" www-data

# Once seeded, drop the DB to read-only at the OS layer. Flask also opens it
# in URI mode 'ro&immutable=1' but defense-in-depth: even if the player gets
# code-exec as www-data, they cannot tamper with the catalogue.
chown root:www-data /var/lib/library/library.db
chmod 0640 /var/lib/library/library.db

# -----------------------------------------------------------------------------
# Plant the flag with a random filename. Random naming is defense-in-depth;
# the off-by-slash actually cannot reach /flags due to URI normalisation, but
# we keep the random name so a misconfigured location block in some future
# variant of this challenge can't accidentally expose it.
# -----------------------------------------------------------------------------
find /flags -type f -delete
RAND_NAME="flag_$(tr -dc 'a-zA-Z0-9' </dev/urandom | head -c 24).txt"
RAND_FLAG="mctf{nginx_off_by_slash_then_python_import_hijack_$(tr -dc 'a-zA-Z0-9' </dev/urandom | head -c 12)}"
printf '%s\n' "$RAND_FLAG" > "/flags/$RAND_NAME"
# World-readable file, dir traversable AND listable. The flag's protection
# is its random filename (24 random alphanumerics, ~10^43 search space),
# NOT directory permissions — the player needs to listdir it from RCE.
chown root:root "/flags/$RAND_NAME"
chmod 0644 "/flags/$RAND_NAME"
chmod 0755 /flags

# -----------------------------------------------------------------------------
# Lock down /app/code so the player's RCE shell (running as www-data via
# gunicorn) can READ everything but cannot modify anything.
# -----------------------------------------------------------------------------
chown -R root:root /app/code
find /app/code -type d -exec chmod 0755 {} \;
find /app/code -type f -exec chmod 0644 {} \;

# Static files served by nginx (worker is www-data) — already 0644, fine.

# Helper directory: this is the ONE writable surface for www-data, by design.
#   - owner root:www-data
#   - mode 3775  ->  group-writable (uploads work)
#                +   setgid (uploaded files inherit www-data group; cleaner can
#                    delete them)
#                +   sticky (www-data can create files but cannot delete or
#                    rename root-owned files inside, so the player CANNOT
#                    overwrite metadata_processor.py even if the helper's
#                    Python-level reserved-name check were bypassed)
chown root:www-data /app/code/debug
chmod 3775 /app/code/debug
# The helper itself stays root-owned and read-only.
chown root:root /app/code/debug/metadata_processor.py
chmod 0644 /app/code/debug/metadata_processor.py

# -----------------------------------------------------------------------------
# Cleanup script and cron job: outside /app/code so the off-by-slash cannot
# reach them, and root-owned so the www-data shell cannot disable them.
# -----------------------------------------------------------------------------
chown root:root /opt/cleanup/cleanup.sh /etc/cron.d/library-cleanup
chmod 0755 /opt/cleanup/cleanup.sh
chmod 0644 /etc/cron.d/library-cleanup
chmod 0750 /opt/cleanup
touch /var/log/library-cleanup.log
chown root:root /var/log/library-cleanup.log
chmod 0644 /var/log/library-cleanup.log

# -----------------------------------------------------------------------------
# nginx writable bits
# -----------------------------------------------------------------------------
mkdir -p /var/cache/nginx/app /var/log/nginx /var/www/html
chown -R www-data:www-data /var/cache/nginx /var/log/nginx
mkdir -p /var/lib/library/covers /var/lib/library/downloads
chown -R www-data:www-data /var/lib/library/covers /var/lib/library/downloads
chmod 0755 /var/lib/library/covers /var/lib/library/downloads
# /var/lib/library itself: keep group www-data, traversable, not writable.
chown root:www-data /var/lib/library
chmod 0750 /var/lib/library

# -----------------------------------------------------------------------------
# Hand off to supervisord (runs nginx + gunicorn-as-www-data + cron-as-root)
# -----------------------------------------------------------------------------
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
