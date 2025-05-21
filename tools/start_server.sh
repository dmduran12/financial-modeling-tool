#!/usr/bin/env bash
# Run the Catona API server

set -e

# Resolve the project root based on this script's location so the
# launcher can be invoked from any working directory.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

python3 launch.py
