#!/usr/bin/env bash
# Build pipeline for the demon.
#
#   1. wat2wasm src/liber.wat -> static/liber.wasm
#   2. embed XOR-obfuscated bytecode into a section the WASM reads at runtime
#      (key derived from a constant the player must recover by spec-reading
#      the WGSL bindings on the page; this is the "WebGPU adapter fingerprint"
#      stub — replace with a real adapter-info hash in production).
#   3. carry static/liber.wgsl through unmodified — the lattice weakness
#      is hand-tuned in the round constants there.
set -euo pipefail

cd "$(dirname "$0")"
mkdir -p static

# 1. compile WAT
wat2wasm src/liber.wat -o static/liber.wasm

# 2. obfuscate the bytecode the demon eats. KEY is the same constant the WASM
#    knows; in the production version this would be derived at runtime from
#    GPUAdapter.requestAdapterInfo() so headless / wrong-adapter solvers get
#    garbage. For the MVP we hardcode it.
KEY=0xA6
python3 src/bytecode.py "$KEY" > static/memories.bin

# 3. flag-render fragment shader is also static
ls -la static/
