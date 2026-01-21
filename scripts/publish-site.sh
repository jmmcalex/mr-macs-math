#!/usr/bin/env bash
set -euo pipefail

if ! command -v git >/dev/null 2>&1; then
  echo "git is required." >&2
  exit 1
fi

message=${1:-"Publish site updates"}

build_output=""
if ! build_output=$(npm run build 2>&1); then
  echo "$build_output"
  echo "Build failed; aborting publish." >&2
  exit 1
fi

echo "$build_output"

if command -v rg >/dev/null 2>&1; then
  if echo "$build_output" | rg -i "\\bwarn(ing)?\\b"; then
    echo "Build warnings detected; aborting publish." >&2
    exit 1
  fi
else
  if echo "$build_output" | grep -Eiq "\\bwarn(ing)?\\b"; then
    echo "Build warnings detected; aborting publish." >&2
    exit 1
  fi
fi

git add .
git commit -m "$message"
git push
npm run deploy
