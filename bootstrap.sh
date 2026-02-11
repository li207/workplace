#!/bin/bash
# Bootstrap script for Workspace setup

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$SCRIPT_DIR"
CLAUDE_DIR="$HOME/.claude"

echo "🏗️  Bootstrapping Workspace..."

# Ensure Claude directories exist
mkdir -p "$CLAUDE_DIR/commands"

# Store workspace paths for global commands
echo "→ Configuring workspace paths"
cat > "$CLAUDE_DIR/workspace-path.txt" << EOF
WORKSPACE_DIR=$WORKSPACE_DIR
WORKSPACE_DATA_DIR=$WORKSPACE_DIR/workspace-data
EOF
echo "  ✓ Workspace paths stored:"
echo "    Framework: $WORKSPACE_DIR"
echo "    Data: $WORKSPACE_DIR/workspace-data"

# Copy global commands
echo "→ Installing global commands"
if [ -d "$WORKSPACE_DIR/commands" ]; then
    cp "$WORKSPACE_DIR/commands"/*.md "$CLAUDE_DIR/commands/" 2>/dev/null || true
    COMMAND_COUNT=$(ls -1 "$WORKSPACE_DIR/commands"/*.md 2>/dev/null | wc -l | tr -d ' ')
    echo "  ✓ $COMMAND_COUNT commands installed globally (task, visual)"
else
    echo "  ⚠️  No commands directory found"
fi

# Setup workspace-data
echo "→ Setting up workspace-data"
if [ ! -d "$WORKSPACE_DIR/workspace-data" ]; then
    # Prompt for workspace-data repo URL
    echo "  Enter workspace-data repository URL (or press Enter to create locally):"
    read -r DATA_REPO_URL

    if [ -n "$DATA_REPO_URL" ]; then
        echo "  Cloning workspace-data from: $DATA_REPO_URL"
        git clone "$DATA_REPO_URL" "$WORKSPACE_DIR/workspace-data"
        echo "  ✓ workspace-data cloned"
    else
        echo "  Creating local workspace-data repository"
        mkdir -p "$WORKSPACE_DIR/workspace-data"
        cd "$WORKSPACE_DIR/workspace-data"
        git init
        echo "  ✓ Local workspace-data repo initialized"
    fi
else
    echo "  ✓ workspace-data already exists"
fi

# Create necessary data directories in workspace-data
mkdir -p "$WORKSPACE_DIR/workspace-data/active"
mkdir -p "$WORKSPACE_DIR/workspace-data/archive/weeks"

# Create initial index.md if it doesn't exist
if [ ! -f "$WORKSPACE_DIR/workspace-data/index.md" ]; then
    cat > "$WORKSPACE_DIR/workspace-data/index.md" << 'EOF'
# Workspace

> Last updated: —

## Active Tasks

No active tasks. Create one with `/task create`.

## This Week
- Completed: 0 tasks
- In progress: 0 tasks
EOF
fi

# Make scripts executable
chmod +x "$WORKSPACE_DIR/scripts"/*.sh

echo ""
echo "✅ Bootstrap complete!"
echo ""
echo "Next steps:"
echo "1. Use '/task review' from anywhere to get started"
echo "2. Try: /task create \"Test the system\" high priority"
echo "3. Sync data: cd workspace-data && git remote add origin <your-private-repo>"
echo ""
echo "Available commands:"
echo "- /task    - Unified task & workspace management"
echo "- /visual  - Real-time dashboard visualization"
echo ""
echo "Utilities:"
echo "- ./scripts/sync.sh - Sync both framework and data repos"
echo ""
echo "Data location: $WORKSPACE_DIR/workspace-data/"
echo ""
