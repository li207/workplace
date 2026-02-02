# Workspace

An intelligent, extensible workspace framework for Claude AI with natural language command processing.

## What is this?

Workspace is a modular framework that brings intelligent task management and data organization to Claude AI. It features:

- **🧠 Natural Language Processing** — Talk to your tasks naturally
- **🔒 Privacy-First Architecture** — Your data stays separate and private  
- **📁 Human-Readable Storage** — Everything in markdown files
- **🔧 Extensible Design** — Add new commands and modules
- **👥 Multi-User Ready** — Teams share framework, individuals keep private data

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
/todo create bug fix task, urgent, due tomorrow

# Create isolated workspace for task
/workspace create workspace for task 1769a4

# Check your workload  
/todo review

# See all tasks and workspaces
/todo list
/workspace list

# Complete work
/todo mark first task as done

# Get help anytime
/todo help
```

### 3. Test the Framework
```bash
# Run comprehensive test suite
./tests/test-runner.sh

# Tests run in isolation - zero risk to your data
# All tests should pass ✅
```

## Architecture

### Framework Structure
```
workspace/                    # 🔓 Public Framework (this repo)
├── commands/                 # Global Claude commands
│   ├── todo.md              # Natural language TODO processor
│   ├── visual.md            # Visualization dashboard
│   └── workspace.md         # Natural language workspace manager
├── modules/                  # Module definitions
│   ├── todo/                # TODO system documentation
│   ├── visual/              # Visualization server
│   └── workspace/           # Workspace system documentation
├── scripts/                  # Automation tools
│   └── sync.sh              # Dual-repo sync
├── bootstrap.sh             # Setup script
├── instructions.md          # Claude context
└── CLAUDE.md                # Quick reference

workspace-data/              # 🔒 Private Data (separate repo)
├── todo/
│   ├── active.md           # Current tasks
│   └── archive/            # Completed tasks by date
│       └── 2026-01-31.md
└── workspace/              # Isolated task workspaces
    ├── {task-id}/          # Task-specific workspace
    │   ├── README.md       # Workspace overview
    │   ├── CLAUDE.md       # Task context for Claude
    │   ├── PROGRESS.md     # Progress tracking
    │   ├── docs/           # Documentation
    │   ├── logs/           # Investigation logs
    │   └── scratch/        # Temporary files
    └── archive/            # Archived workspaces
```

### Privacy Model
- **Framework repo**: Shareable tools, commands, documentation
- **Data repo**: Private tasks, personal information, separate git repository
- **Data folder**: Automatically gitignored from framework repo

## Available Commands

### 🗣️ Natural Language TODO
Intelligent task management that understands conversational commands:

```bash
# Creating tasks
/todo create API integration, high priority, needs team review
/todo add client meeting friday, include budget discussion
/todo new security audit task, reference OWASP guidelines

# Managing tasks  
/todo list                          # See numbered tasks
/todo mark task 2 as done           # Complete by number
/todo change first task to urgent   # Update priority
/todo move deadline to next week    # Reschedule

# Getting insights
/todo review                        # Summary with overdue alerts
/todo what's due this week?         # Filtered view
/todo show my current workload      # Status overview
```

### 📁 Natural Language Workspaces
Isolated task-specific environments that understand conversational commands:

```bash
# Creating workspaces
/workspace create workspace for task 1769a4
/workspace make debug environment for auth bug
/workspace setup docs folder for API task

# Accessing workspaces
/workspace open 1769a4              # Navigate to workspace
/workspace list                     # See all workspaces
/workspace status                   # Show progress

# Managing workspaces
/workspace summarize                # Update progress notes
/workspace clean completed          # Archive finished workspaces
```

### 📊 Visual Dashboard
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

## Extending Workplace

### Adding New Commands
1. Create `commands/newcommand.md` with natural language processing
2. Bootstrap automatically installs to `~/.claude/commands/`
3. Use from anywhere with `/newcommand`

### Adding New Modules
1. Create `modules/modulename/README.md` with specifications
2. Add data structures to `workspace-data/modulename/`
3. Optionally create global commands for the module


## Data Format

Tasks are stored with clean titles and rich context:

```markdown
- [ ] Fix authentication bug #id:abc123
  - priority: high
  - created: 2026-01-31
  - due: 2026-02-02
  - tags: [security, backend]
  - context: Requires database migration, coordinate with DevOps team, reference security audit in /docs/security-review.md
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