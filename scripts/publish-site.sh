#!/usr/bin/env bash
set -euo pipefail

if ! command -v git >/dev/null 2>&1; then
  echo "git is required." >&2
  exit 1
fi

message=${1:-"Publish site updates"}

git add .
git commit -m "$message"
git push
npm run deploy
