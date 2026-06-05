FROM node:20-bookworm-slim

# Firestore emulator needs a JRE. Auth + Functions emulators need node (already have it).
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      openjdk-17-jre-headless \
      curl \
      tini \
 && rm -rf /var/lib/apt/lists/*

RUN useradd -ms /bin/bash admit
WORKDIR /srv/app

# Emulator binaries + server deps
COPY src/package.json src/package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund \
 && npm install -g firebase-tools@13.23.1

# Copy app sources
COPY src/ ./

# Build the Cloud Functions TS → JS
RUN cd functions \
 && npm install --no-audit --no-fund \
 && npm run build

# Pre-download Firebase emulator JAR cache so first run is fast
RUN firebase setup:emulators:firestore || true \
 && firebase setup:emulators:ui || true

RUN mkdir -p /srv/app/ops \
 && chown -R admit:admit /srv/app

USER admit
ENV PORT=3000 \
    NODE_ENV=production \
    FIREBASE_PROJECT=admit-mctf

EXPOSE 3000
ENTRYPOINT ["/usr/bin/tini","--"]
CMD ["node","server.js"]
