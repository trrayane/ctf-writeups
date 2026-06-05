# ─── stage 1: encrypt the plaintexts at build time ──────────────────────────
FROM python:3.12-slim AS build

WORKDIR /build
COPY src/build /build/build
COPY src/plaintexts /build/plaintexts
ENV OUT_DIR=/build/out
RUN python /build/build/encrypt.py

# ─── stage 2: serve via MCP streamable-HTTP ─────────────────────────────────
FROM python:3.12-slim AS server

WORKDIR /app

COPY src/server/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY src/server /app/server
COPY --from=build /build/out /app/out

ENV PORT=8080
ENV OUT_DIR=/app/out
EXPOSE 8080

CMD ["python", "/app/server/server.py"]
