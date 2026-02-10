# Workspace Module

Isolated task-specific workspace management with natural language processing.

## Overview

The Workspace module creates and manages isolated folder environments for individual tasks. Each workspace is linked to a TODO task by its ID and provides a dedicated space for:

- Documentation and specifications
- Debug logs and investigation notes  
- Temporary files and experiments
- Any task-related materials

## File Organization

| Directory | Purpose |
|-----------|---------|
| `workspace-data/workspace/` | Root workspace directory |
| `workspace-data/workspace/{task-id}/` | Individual task workspace |
| `workspace-data/workspace/{task-id}/README.md` | Workspace overview with task details |
| `workspace-data/workspace/{task-id}/CLAUDE.md` | Task context for Claude sessions |
| `workspace-data/workspace/{task-id}/PLAN.md` | Co-authored plan (Claude drafts, user reviews) |
| `workspace-data/workspace/{task-id}/PROGRESS.md` | Progress tracking and status updates |
| `workspace-data/workspace/{task-id}/docs/` | Documentation directory |
| `workspace-data/workspace/{task-id}/logs/` | Log files and investigation notes |
| `workspace-data/workspace/{task-id}/scratch/` | Temporary files and experiments |

## Data Format

### Workspace README Template
```markdown
# Workspace for Task: {task-title}
**Task ID:** {task-id}
**Priority:** {priority}
**Status:** {status}
**Created:** {date}

## Purpose
{context from original task}

## Structure
- `docs/` - Documentation and specifications
- `logs/` - Debug logs, error traces, investigation notes
- `scratch/` - Temporary files, experiments, drafts

## Related
- Original task: workspace-data/todo/active.md#{task-id}
```

### Workspace Directory Structure
```
{task-id}/
├── README.md           # Workspace overview
├── CLAUDE.md           # Task context for Claude
├── PLAN.md             # Co-authored plan
├── PROGRESS.md         # Progress tracking
├── docs/               # Documentation
│   ├── requirements.md
│   ├── api-spec.md
│   └── investigation.md
├── logs/               # Investigation logs
│   ├── debug.log
│   ├── error-traces.md
│   └── timeline.md
└── scratch/            # Temporary work
    ├── notes.md
    ├── experiments/
    └── prototypes/
```

### PLAN.md Structure

The PLAN.md file is the core collaboration artifact between user and Claude:

| Section | Purpose |
|---------|---------|
| **Objective** | What this task aims to accomplish |
| **Approach** | High-level strategy — Claude drafts, user reviews via Obsidian |
| **Design** | Technical details, architecture decisions |
| **Open Questions** | Unresolved items needing user input |
| **Decisions Log** | Timestamped record of decisions and rationale |

**Co-authoring workflow:** Claude drafts the plan during workspace creation or planning sessions. The user reviews and edits via Obsidian. Claude re-reads PLAN.md at session start to pick up any changes.

### PROGRESS.md Structure

The PROGRESS.md file tracks workspace progress with a structured Status block and 7 sections:

| Section | Purpose |
|---------|---------|
| **Current Focus** | What you're actively working on right now |
| **Next Actions** | Checkbox list of upcoming tasks (drives progress %) |
| **Accomplishments** | Timestamped log of completed work |
| **Blockers** | Issues preventing progress |
| **Notes** | General observations and context |
| **Links** | Related PRs, docs, resources |
| **Decisions** | Key decisions made during this work |

**Status Block (top of PROGRESS.md):**
```markdown
## Status
- **State**: Not Started | In Progress | Blocked | Ready for Review | Done
- **Branch**: {git branch if applicable}
- **Last session**: YYYY-MM-DD HH:MM
- **Summary**: {One-line summary of current state}
- **Next action**: {Single most important next step}
- **Blocked on**: {Blocker or "Nothing"}
```

**Progress Auto-Calculation:** The progress percentage is automatically calculated from the Next Actions checkboxes. The dashboard counts `- [x]` (completed) vs total checkboxes to compute the percentage.

**Example Accomplishments entries:**
```markdown
## Accomplishments
- [2026-02-02 14:30] Completed initial API design
- [2026-02-02 16:15] Fixed authentication bug in login flow
- [2026-02-03 09:00] Added unit tests for user service
```

**Example Next Actions with progress:**
```markdown
## Next Actions
- [x] Design API endpoints
- [x] Implement authentication
- [ ] Add error handling
- [ ] Write documentation

Progress: 50% (2/4 completed)
```

## Operations

### Create Workspace
Create isolated workspace for a task using natural language.

**Natural Language Usage:**
- Use conversational commands to create workspaces
- Reference tasks by ID, position, or description
- System automatically creates folder structure

**Examples:**
```bash
# By task ID
/workspace create workspace for task 1769a4
/workspace make new workspace for 1769a4
/workspace setup folder for task 1769a4

# By task reference  
/workspace create workspace for first task
/workspace make folder for the auth bug
/workspace setup workspace for critical bug

# With purpose
/workspace create docs workspace for API task
/workspace setup debug environment for bug 1769a4
```

**What gets created:**
- **Folder**: `workspace-data/workspace/{task-id}/`
- **README**: Workspace overview with task context
- **PLAN.md**: Co-authored plan template
- **PROGRESS.md**: Progress tracking with structured Status block
- **CLAUDE.md**: Task context with session-start and auto-update rules
- **Structure**: Standard docs/, logs/, scratch/ directories
- **Integration**: Links to original task in TODO system

### Access Workspace
Navigate to or get information about existing workspace.

**Usage:** `/workspace open "{task-reference}"`

**Examples:**
```bash
/workspace open 1769a4
/workspace access first task workspace
/workspace go to auth bug workspace
/workspace cd to critical bug folder
```

### List Workspaces
Display all workspaces with task context.

**Usage:** `/workspace list`

**Output format:**
```
## Active Workspaces (2 workspaces)

1. 1769a4: [P0] Fix critical auth bug (5 files, updated: 2 hours ago)
2. 176984: [P2] API documentation update (2 files, updated: 1 day ago)
```

### Workspace Info
Show detailed information about a workspace.

**Usage:** `/workspace info "{task-reference}"`

**Examples:**
```bash
/workspace info 1769a4
/workspace details for auth bug
/workspace status of first task workspace
```

**Output:**
```
## Workspace: 1769a4
**Task:** [P0] Fix critical auth bug
**Created:** 2026-01-31
**Location:** workspace-data/workspace/1769a4/

### Contents:
- README.md (task overview)
- docs/ (2 files)
  - requirements.md
  - investigation.md
- logs/ (3 files)
  - debug.log
  - error-traces.md
  - timeline.md
- scratch/ (1 file)
  - notes.md

**Total Size:** 234 KB
**Last Updated:** 2 hours ago
```

### Clean Workspaces
Archive or remove workspace folders.

**Usage:** `/workspace clean "{criteria}"`

**Examples:**
```bash
/workspace clean completed workspaces
/workspace remove unused workspaces  
/workspace archive old workspaces
```

### Help
Display comprehensive command manual with examples.

**Usage:** `/workspace help`

**Shows:**
- All available operations with natural language examples
- Workspace structure specifications
- Integration patterns with TODO system
- Common workflow examples

## Integration with TODO System

Workspaces are automatically integrated with the TODO system:

- **ID Linking**: Workspace folder name matches task ID
- **Context Transfer**: Task title, priority, and context copied to workspace README
- **Status Sync**: Workspace can be archived when task is completed
- **Cross-Reference**: Easy navigation between task and workspace

## Common Workflows

### Bug Investigation
```bash
/workspace create debug workspace for bug 1769a4
# Use logs/ for error traces and investigation notes
# Use docs/ for root cause analysis and fix specifications
# Use scratch/ for testing scripts and temporary fixes
```

### Feature Development  
```bash
/workspace setup dev environment for feature 176984
# Use docs/ for feature specifications and API documentation
# Use scratch/ for prototypes and experiments
# Use logs/ for development progress and decisions
```

### Research Task
```bash
/workspace make research folder for investigation
# Use docs/ for research findings and conclusions
# Use scratch/ for experiments and data collection
# Use logs/ for methodology and progress tracking
```

## Benefits

- **Task Isolation**: Each task gets dedicated workspace
- **Consistent Organization**: Standard structure across all workspaces  
- **Easy Discovery**: Find workspace using task ID or description
- **Integrated Context**: Task details automatically included
- **Flexible Structure**: Add any files/folders needed within workspace
- **Automatic Cleanup**: Archive workspaces when tasks complete

## Daily Workflow

1. **Create workspace:** `/workspace create` for new task
2. **Work in isolation:** Use dedicated folders for task materials
3. **Quick access:** `/workspace open` to navigate to workspace
4. **Review progress:** `/workspace list` to see all active workspaces
5. **Clean up:** Archive workspace when task is completed

## Obsidian Integration

The `workspace-data/` directory serves as an Obsidian vault root. Open it as a vault in Obsidian to:

- **Review and edit PLAN.md** — co-author plans with Claude
- **Monitor PROGRESS.md** — track status and accomplishments
- **Browse workspaces** — navigate between task workspaces visually

The `.obsidian/` config directory is gitignored in the framework repo. Each user's Obsidian settings remain local.

## Archiving

When a task is completed:
1. Workspace can be archived to `workspace-data/archive/`
2. Important files can be extracted and saved elsewhere
3. Workspace folder can be compressed for storage
4. Links to archived workspaces maintained in task history