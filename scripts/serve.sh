#!/usr/bin/env bash
# Serve dist/ locally for testing.  Defaults to port 8080.
#
# Usage:  npm run serve
#         PORT=3000 npm run serve

set -euo pipefail
PORT="${PORT:-8080}"

if [[ ! -f dist/index.html ]]; then
  echo "dist/index.html not found — building first..."
  bash scripts/build.sh
fi

if command -v python3 >/dev/null 2>&1; then
  echo "Serving dist/ at http://localhost:${PORT}"
  cd dist
  exec python3 -m http.server "$PORT"
elif command -v npx >/dev/null 2>&1; then
  echo "Serving dist/ at http://localhost:${PORT}"
  exec npx --yes http-server dist -p "$PORT" --silent
else
  echo "error: need either python3 or npx (Node) to run a local server" >&2
  exit 1
fi
