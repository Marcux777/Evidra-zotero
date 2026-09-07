#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/.."
exec rtk proxy uv run --project services/engine --frozen python scripts/check.py "$@"
