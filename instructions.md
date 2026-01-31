# Workplace - Personal Workspace Management System

This is a modular, file-based personal workspace system designed to work with Claude (both Claude Code CLI and Claude Cowork desktop app).

## Core Principles

1. **File-based storage** — All data stored in markdown files, human-readable and portable
2. **Data separation** — Personal data lives in `/data/` (private), everything else is shareable
3. **Modular design** — Features are organized as independent modules
4. **Claude-native** — This file provides context for any Claude session
5. **Git-friendly** — Version control for both framework and data (separately)

## Directory Structure

```
workplace/
├── instructions.md          # This file - master context for Claude
├── CLAUDE.md                # Claude Code specific commands/shortcuts
├── README.md                # Public documentation for sharing
├── .gitignore               # Ignores /data/ folder
│
├── .skills/                 # Custom skills for Claude
│   └── todo/
│       └── SKILL.md
│
├── modules/                 # Module definitions and templates
│   ├── todo/
│   │   └── README.md
│   └── [future modules]/
│
├── scripts/                 # Automation scripts
│   └── sync.sh
│
└── workplace-data/          # ⛔ PRIVATE - separate git repo, gitignored
    ├── todo/
    │   ├── inbox.md         # Uncategorized/new tasks
    │   ├── today.md         # Today's focus
    │   ├── upcoming.md      # Scheduled future tasks
    │   └── archive/         # Completed tasks by date
    │       └── 2026-01-31.md
    ├── notes/
    ├── journal/
    └── [future module data]/
```

## Active Modules

### TODO Module
Location: `modules/todo/` (definition) + `workplace-data/todo/` (data)

**Operations:**
- `todo add <task> [--priority high|medium|low] [--due YYYY-MM-DD]` — Create a new task
- `todo list [today|upcoming|all]` — Show tasks
- `todo done <task_id or description>` — Mark task complete
- `todo move <task_id> <today|upcoming|inbox>` — Move task between lists
- `todo review` — Show overdue and today's tasks

**Data format** (in markdown files):
```markdown
- [ ] Task description #id:abc123
  - priority: high
  - due: 2026-02-01
  - created: 2026-01-30
  - tags: [work, urgent]
```

## How to Interact

When starting a new Claude session in this directory:

1. Claude should read this `instructions.md` to understand the workspace
2. For specific modules, read the module's README in `modules/<name>/`
3. All personal data operations happen in `/workplace-data/`
4. Use the defined operations/commands for consistency

## Adding New Modules

1. Create `modules/<module-name>/README.md` with:
   - Purpose and description
   - Data format specification
   - Available operations
2. Create `workplace-data/<module-name>/` for the module's data files
3. Optionally add `.skills/<module-name>/SKILL.md` for Claude skills
4. Update this file's "Active Modules" section

## Git Setup

This workspace uses two independent git repositories:

1. **Framework repo** (this directory): Public/shareable
   - Push to: public or shared remote
   - Contains: instructions, modules, skills, scripts

2. **Data repo** (`/workplace-data/` directory): Private
   - Push to: private remote (or local-only)
   - Contains: all personal data

The `/workplace-data/` folder is gitignored in the parent repo.
