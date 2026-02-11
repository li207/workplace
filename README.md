# Workspace

An intelligent, extensible workspace framework for Claude AI with natural language command processing.

## What is this?

Workspace is a modular framework that brings intelligent task management and data organization to Claude AI. It features:

- **Natural Language Processing** — Talk to your tasks naturally
- **Privacy-First Architecture** — Your data stays separate and private
- **Human-Readable Storage** — Everything in markdown files
- **Extensible Design** — Add new commands and modules
- **Multi-User Ready** — Teams share framework, individuals keep private data

## Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/li207/workspace
cd workspace
./bootstrap.sh
```

The bootstrap will ask for your workspace-data repository:
- **Press Enter** to create a local data repo
- **Enter URL** to clone existing private workspace data

### 2. Start Using Natural Language Commands
```bash
# Create tasks naturally
/task create bug fix task, urgent, due tomorrow

# Open a task workspace
/task open first task

# Check your workload
/task review

# See all tasks
/task list

# Complete work
/task done first task

# Get help anytime
/task help
```

### 3. Test the Framework
```bash
# Run comprehensive test suite
./tests/test-runner.sh

# Tests run in isolation - zero risk to your data
# All tests should pass
```

## Architecture

### Framework Structure
```
workspace/                    # Public Framework (this repo)
├── commands/                 # Global Claude commands
│   ├── task.md              # Unified task & workspace management
│   └── visual.md            # Visualization dashboard
├── modules/                  # Module definitions
│   ├── task/                # Task system documentation
│   └── visual/              # Visualization server
├── scripts/                  # Automation tools
│   └── sync.sh              # Dual-repo sync
├── bootstrap.sh             # Setup script
├── instructions.md          # Claude context
└── CLAUDE.md                # Quick reference

workspace-data/              # Private Data (separate repo)
├── index.md                 # Auto-generated canonical view
├── active/                  # Active task workspaces
│   └── {task-id}/
│       ├── task.md          # Metadata (priority, due, tags, context)
│       ├── CLAUDE.md        # Task context for Claude
│       ├── PLAN.md          # Co-authored plan
│       ├── PROGRESS.md      # Progress tracking
│       ├── docs/            # Documentation
│       ├── logs/            # Investigation logs
│       └── scratch/         # Temporary files
└── archive/                 # Completed tasks
    ├── {task-id}/           # Archived task folder
    └── weeks/               # Weekly summaries
```

### Privacy Model
- **Framework repo**: Shareable tools, commands, documentation
- **Data repo**: Private tasks, personal information, separate git repository
- **Data folder**: Automatically gitignored from framework repo

## Available Commands

### /task — Unified Task & Workspace Management
Intelligent task management with isolated workspaces, natural language processing:

```bash
# Creating tasks (auto-creates workspace folder)
/task create API integration, high priority, needs team review
/task add client meeting friday, include budget discussion
/task new security audit task, reference OWASP guidelines

# Working on tasks
/task open first task                   # Switch context to task
/task plan auth bug                     # Co-author PLAN.md

# Managing tasks
/task list                              # See active tasks
/task done first task                   # Archive completed task
/task update priority to p0             # Change metadata
/task update progress: finished tests   # Log progress

# Getting insights
/task review                            # Summary with overdue alerts
```

### /visual — Dashboard
Real-time workspace visualization and monitoring:

```bash
/visual                             # Start and open dashboard
/visual start                       # Start server only
/visual stop                        # Stop server
/visual status                      # Check server status
```

## Multi-User Setup

### For Teams
1. **Share Framework**: Everyone clones the same workspace repo
2. **Private Data**: Each person creates their own workspace-data repo
3. **Stay Updated**: Pull framework updates, keep data separate

### Personal Setup Options

**Option A: Private GitHub Repo**
```bash
./bootstrap.sh  # Press Enter for local
cd workspace-data
gh repo create my-workspace --private --source=. --push
```

**Option B: Clone Existing Data**
```bash
./bootstrap.sh  # Enter your existing workspace-data URL
# https://github.com/yourusername/your-workspace-data
```

**Option C: Local Only**
```bash
./bootstrap.sh  # Press Enter, keep local
# No remote sync needed
```

## Extending Workspace

### Adding New Commands
1. Create `commands/newcommand.md` with natural language processing
2. Bootstrap automatically installs to `~/.claude/commands/`
3. Use from anywhere with `/newcommand`

### Adding New Modules
1. Create `modules/modulename/README.md` with specifications
2. Add data structures to `workspace-data/modulename/`
3. Optionally create global commands for the module


## Data Format

Tasks are stored with structured metadata in their own folder:

```markdown
# Fix authentication bug
- **id**: abc123
- **priority**: p1
- **created**: 2026-01-31
- **due**: 2026-02-02
- **tags**: [security, backend]

## Context
Requires database migration, coordinate with DevOps team
```

## Syncing

Sync both framework and data repositories:
```bash
./scripts/sync.sh  # Pushes both repos with timestamps
```

## Contributing

- **Framework improvements**: Submit PRs to this repo
- **New modules**: Follow module documentation patterns
- **Commands**: Use natural language processing patterns
- **Data formats**: Keep human-readable markdown

## License

MIT — Use it, modify it, share it freely.
