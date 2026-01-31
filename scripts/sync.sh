#!/bin/bash
# Sync both framework and data repos

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKPLACE_DIR="$(dirname "$SCRIPT_DIR")"

echo "📁 Syncing workplace..."

# Sync framework repo
cd "$WORKPLACE_DIR"
if [ -d ".git" ]; then
    echo "→ Framework repo"
    git add -A
    git diff --cached --quiet || git commit -m "sync: $(date '+%Y-%m-%d %H:%M')"
    git push 2>/dev/null || echo "  (no remote or push failed)"
else
    echo "  ⚠️ Framework repo not initialized"
fi

# Sync workplace-data repo
if [ -d "$WORKPLACE_DIR/workplace-data/.git" ]; then
    echo "→ Workplace-data repo"
    cd "$WORKPLACE_DIR/workplace-data"
    git add -A
    git diff --cached --quiet || git commit -m "sync: $(date '+%Y-%m-%d %H:%M')"
    git push 2>/dev/null || echo "  (no remote or push failed)"
else
    echo "  ⚠️ Workplace-data repo not initialized"
fi

echo "✅ Done"
