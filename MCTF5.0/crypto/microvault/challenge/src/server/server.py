#!/usr/bin/env python3
"""
Microvault MCP server (streamable-HTTP transport).

Exposes two tools:
  list_assets()           -> ordered list of asset filenames
  read_asset(name)        -> {name, size, data_b64} for one asset

No cipher metadata is disclosed by the server. The names returned by
list_assets() are opaque (vault.NNNN.bin) and reveal nothing about the
contents.
"""

import base64
import os
from pathlib import Path

from mcp.server.fastmcp import FastMCP

OUT_DIR = Path(os.environ.get("OUT_DIR", "/app/out"))

# fixed asset order — matches the encryption order in build/encrypt.py
ASSET_ORDER = (OUT_DIR / "manifest.txt").read_text().strip().splitlines()
ASSETS = {name: (OUT_DIR / name).read_bytes() for name in ASSET_ORDER}

mcp = FastMCP(
    "Microvault",
    host="0.0.0.0",
    port=int(os.environ.get("PORT", "8080")),
    streamable_http_path="/mcp",
)


@mcp.tool()
def list_assets() -> list[str]:
    """List the asset filenames stored in the Microvault, in storage order."""
    return list(ASSET_ORDER)


@mcp.tool()
def read_asset(name: str) -> dict:
    """
    Return the contents of one asset, base64-encoded.

    Args:
        name: filename as returned by list_assets().
    """
    if name not in ASSETS:
        raise ValueError(f"unknown asset: {name!r}")
    blob = ASSETS[name]
    return {
        "name": name,
        "size": len(blob),
        "data_b64": base64.b64encode(blob).decode("ascii"),
    }


if __name__ == "__main__":
    mcp.run(transport="streamable-http")
