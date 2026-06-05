FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
         nginx supervisor cron curl procps ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir flask requests gunicorn pyjwt

# Application
COPY app/ /app/code/

# nginx (intentionally vulnerable off-by-slash)
COPY nginx.conf /etc/nginx/nginx.conf
RUN rm -f /etc/nginx/sites-enabled/* /etc/nginx/conf.d/*.conf

# Discoverable copy of nginx.conf for the player to find via fuzzing /deploy/.
RUN mkdir -p /opt/deploy
COPY nginx.conf /opt/deploy/nginx.conf
RUN chmod 0755 /opt/deploy && chmod 0644 /opt/deploy/nginx.conf

# supervisord (runs nginx + gunicorn + cron)
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Maintenance: lives outside /app/code/ so the off-by-slash cannot read it.
RUN mkdir -p /opt/cleanup
COPY cleanup/cleanup.sh /opt/cleanup/cleanup.sh
COPY cleanup/library-cleanup /etc/cron.d/library-cleanup
RUN chmod 0755 /opt/cleanup/cleanup.sh \
    && chmod 0644 /etc/cron.d/library-cleanup \
    && touch /var/log/library-cleanup.log \
    && chmod 0644 /var/log/library-cleanup.log

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN mkdir -p /var/lib/library /var/cache/nginx/app /var/log/nginx /var/www/html /flags \
    && chown -R www-data:www-data /var/lib/library /var/cache/nginx /var/log/nginx

EXPOSE 80

CMD ["/entrypoint.sh"]
