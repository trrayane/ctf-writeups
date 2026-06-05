# Two-stage: build the WAT first, then a slim aiohttp runtime.
FROM debian:bookworm-slim AS wat-builder
RUN apt-get update && apt-get install -y --no-install-recommends \
      wabt python3 ca-certificates curl xxd \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /build
COPY src/ ./src/
COPY static/ ./static/
COPY build.sh ./
RUN bash build.sh

FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir 'aiohttp==3.9.5' 'cryptography==42.0.5'
COPY server.py ./
COPY --from=wat-builder /build/static /app/static
RUN mkdir -p /flag
COPY flag.txt /flag/flag.txt
RUN chmod 0400 /flag/flag.txt
EXPOSE 8080
CMD ["python", "-u", "server.py"]
