#!/usr/bin/env bash

set -euo pipefail

MANIFEST="$(cd "$(dirname "$0")/.." && pwd)/manifest.json"

usage() {
  echo "Usage: $0 -v <version>"
  echo "  -v  Version string to set (e.g. 1.2.3)"
  exit 1
}

VERSION=""
while getopts "v:" opt; do
  case "$opt" in
    v) VERSION="$OPTARG" ;;
    *) usage ;;
  esac
done

[ -z "$VERSION" ] && usage

if [ ! -f "$MANIFEST" ]; then
  echo "Error: manifest.json not found at $MANIFEST"
  exit 1
fi

if command -v jq &>/dev/null; then
  TMP=$(mktemp)
  jq --arg v "$VERSION" '. + {version: $v}' "$MANIFEST" > "$TMP" && mv "$TMP" "$MANIFEST"
else
  # Fallback: use node if jq is unavailable
  node -e "
    const fs = require('fs');
    const m = JSON.parse(fs.readFileSync('$MANIFEST', 'utf8'));
    m.version = '$VERSION';
    fs.writeFileSync('$MANIFEST', JSON.stringify(m, null, 2) + '\n');
  "
fi

echo "Version set to $VERSION in $MANIFEST"
