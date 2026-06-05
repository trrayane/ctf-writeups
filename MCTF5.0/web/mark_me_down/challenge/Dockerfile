FROM node:20-slim

# Install the LaTeX engine and packages required for PDF compilation.
RUN apt-get update && \
    apt-get install -y texlive-latex-base texlive-latex-extra vim sudo && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN touch /etc/sudoers.d/rule && \
    echo "appuser ALL=(ALL) NOPASSWD: /usr/bin/vim" > /etc/sudoers.d/rule && \
    chmod 440 /etc/sudoers.d/rule
WORKDIR /app

# Install npm dependencies before copying the whole project for better layer caching.
COPY package.json ./
RUN npm install

# Copy TypeScript sources and build server/client outputs.
COPY tsconfig.server.json tsconfig.client.json ./
COPY src ./src
COPY public ./public
RUN npm run build

# Add challenge flag.
RUN mkdir -p /flag
COPY flag.txt /flag
RUN chown root:root /flag && chmod 0400 /flag

# Create temp directory and switch to a non-root runtime user.
RUN mkdir -p /tmp/latex
RUN useradd -m -u 10001 appuser && chown -R appuser:appuser /app /tmp/latex

ENV RENDER_OUTPUT_DIR=/tmp/latex
ENV FILE_TTL_MINUTES=30
ENV CLEANUP_INTERVAL_MINUTES=30
ENV RENDER_URL_PREFIX=/renders

USER appuser

EXPOSE 3000

CMD ["node", "dist/main.js"]
