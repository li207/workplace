#!/bin/bash
# Bootstrap script for Workplace setup

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKPLACE_DIR="$SCRIPT_DIR"
CLAUDE_DIR="$HOME/.claude"

echo "🏗️  Bootstrapping Workplace..."

# Ensure Claude directories exist
mkdir -p "$CLAUDE_DIR/commands"

# Store workplace paths for global commands
echo "→ Configuring workplace paths"
cat > "$CLAUDE_DIR/workplace-path.txt" << EOF
WORKPLACE_DIR=$WORKPLACE_DIR
WORKPLACE_DATA_DIR=$WORKPLACE_DIR/workplace-data
EOF
echo "  ✓ Workplace paths stored:"
echo "    Framework: $WORKPLACE_DIR"
echo "    Data: $WORKPLACE_DIR/workplace-data"

# Copy global commands
echo "→ Installing global commands"
if [ -d "$WORKPLACE_DIR/commands" ]; then
    cp "$WORKPLACE_DIR/commands"/*.md "$CLAUDE_DIR/commands/" 2>/dev/null || true
    echo "  ✓ TODO command installed globally"
else
    echo "  ⚠️  No commands directory found"
fi

# Setup workplace-data
echo "→ Setting up workplace-data"
if [ ! -d "$WORKPLACE_DIR/workplace-data" ]; then
    # Prompt for workplace-data repo URL
    echo "  Enter workplace-data repository URL (or press Enter to create locally):"
    read -r DATA_REPO_URL
    
    if [ -n "$DATA_REPO_URL" ]; then
        echo "  Cloning workplace-data from: $DATA_REPO_URL"
        git clone "$DATA_REPO_URL" "$WORKPLACE_DIR/workplace-data"
        echo "  ✓ workplace-data cloned"
    else
        echo "  Creating local workplace-data repository"
        mkdir -p "$WORKPLACE_DIR/workplace-data"
        cd "$WORKPLACE_DIR/workplace-data"
        git init
        echo "  ✓ Local workplace-data repo initialized"
    fi
else
    echo "  ✓ workplace-data already exists"
fi

# Create necessary data directories in workplace-data
mkdir -p "$WORKPLACE_DIR/workplace-data/todo/archive"
mkdir -p "$WORKPLACE_DIR/workplace-data/notes"
mkdir -p "$WORKPLACE_DIR/workplace-data/journal"

# Create initial TODO files if they don't exist
if [ ! -f "$WORKPLACE_DIR/workplace-data/todo/inbox.md" ]; then
    cat > "$WORKPLACE_DIR/workplace-data/todo/inbox.md" << 'EOF'
# Inbox

New tasks without a scheduled date.

---

EOF
fi

if [ ! -f "$WORKPLACE_DIR/workplace-data/todo/today.md" ]; then
    cat > "$WORKPLACE_DIR/workplace-data/todo/today.md" << 'EOF'
# Today

Tasks to focus on today.

---

EOF
fi

if [ ! -f "$WORKPLACE_DIR/workplace-data/todo/upcoming.md" ]; then
    cat > "$WORKPLACE_DIR/workplace-data/todo/upcoming.md" << 'EOF'
# Upcoming

Tasks scheduled for future dates.

---

EOF
fi

# Make scripts executable
chmod +x "$WORKPLACE_DIR/scripts"/*.sh

echo ""
echo "✅ Bootstrap complete!"
echo ""
echo "Next steps:"
echo "1. Use '/todo review' from anywhere to get started"
echo "2. Try: /todo add \"Test the system\" --priority high"
echo "3. Sync data: cd workplace-data && git remote add origin <your-private-repo>"
echo ""
echo "Available commands:"
echo "- /todo <operation> - Global TODO management (works from anywhere)"
echo "- ./scripts/sync.sh - Sync both framework and data repos"
echo ""
echo "Data location: $WORKPLACE_DIR/workplace-data/"
echo ""