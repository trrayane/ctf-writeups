# Dockerfile for the Rubik's Cube CTF challenge Flask application.
# Flag is read solely from the CTF_FLAG env var (set at deploy time, e.g.
# via docker-compose `environment:` or by Whaley) so per-team / per-instance
# flag injection works cleanly without baking the canonical flag into the
# image.
FROM python:3-alpine

WORKDIR /app

RUN pip install --no-cache-dir flask

COPY src /app

# Belt-and-braces: ensure no stale flag.txt is shipped in the image, even if
# someone re-introduces it under src/ in the future.
RUN rm -f /app/flag.txt

EXPOSE 8000

CMD ["python", "./app.py"]
