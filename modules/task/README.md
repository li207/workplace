# Task Module - Unified Task & Workspace Management

A single command for creating, tracking, and completing tasks with isolated workspaces.

## Overview

The `/task` command replaces the old `/todo` + `/workspace` commands. Each task gets its own folder containing metadata, plans, progress tracking, and work files. The `workspace-data/` directory serves as an Obsidian vault with `dashboard.md` as the canonical entry point.

## Quick Start
```bash
/task create fix auth bug, urgent, due tomorrow
/task list
/task open first task
/task done auth bug
/task review
```

## Data Layout

```
workspace-data/
├── dashboard.md                    ← auto-generated canonical view
├── active/
│   └── {task-id}/
│       ├── task.md             ← metadata (priority, due, tags, context)
│       ├── PLAN.md             ← co-authored plan
│       ├── PROGRESS.md         ← progress tracking with status block
│       ├── CLAUDE.md           ← session context and rules
│       ├── docs/               ← documentation
│       ├── logs/               ← investigation logs
│       └── scratch/            ← temporary files
├── archive/
│   └── {task-id}/              ← completed tasks (same structure)
└── weeks/
    └── YYYY-MM-DD.md           ← weekly summaries (Monday date)
```

## Intents

| Intent | Aliases | Description |
|--------|---------|-------------|
| **CREATE** | create, add, new | Create a new task with folder structure |
| **LIST** | list, show | Display active tasks from dashboard.md |
| **OPEN** | open, work on, switch | Switch context to a task |
| **DONE** | done, complete, finish | Archive a completed task |
| **UPDATE** | update, change, modify | Change metadata or log progress |
| **PLAN** | plan | Co-author PLAN.md |
| **REVIEW** | review, status | Full scan, regenerate dashboard, show stats |
| **HELP** | help | Show this documentation |

## Templates

### task.md
```markdown
# {Task title}
- **id**: {task-id}
- **priority**: p0|p1|p2|p3
- **created**: YYYY-MM-DD
- **due**: YYYY-MM-DD
- **tags**: [tag1, tag2]

## Context
{Details, requirements, notes}
```

When completing: add `- **completed**: YYYY-MM-DD` and summary to Context.

### PLAN.md
```markdown
# Plan: {title}

## Objective
{Clear, measurable outcome. What does "done" look like?}

## Context
{Background info a new session needs: relevant files, current state, constraints, dependencies}

## Steps
1. **{Step title}**
   - What: {Specific action}
   - Where: {File paths, endpoints, components affected}
   - How: {Implementation details, approach}
   - Done when: {Verification criteria}

## Design
{Technical details, architecture decisions — if applicable}

## Decisions
| Date | Decision | Rationale |
|------|----------|-----------|
```

**Interactive planning:** `/task plan` triggers an interactive session — Claude asks clarifying questions, researches relevant code, then drafts detailed steps. The plan is iterated through conversation until approved, then written to PLAN.md and synced to PROGRESS.md Next Actions.

**Quality bar:** A new Claude session reading only PLAN.md + task.md + CLAUDE.md should be able to execute without asking clarifying questions.

### PROGRESS.md
```markdown
# Progress: {title}

## Status
- **State**: Not Started | In Progress | Blocked | Ready for Review | Done
- **Branch**: {git branch if applicable}
- **Last session**: YYYY-MM-DD HH:MM
- **Summary**: {One-line current state}
- **Next action**: {Most important next step}
- **Blocked on**: {Blocker or "Nothing"}

## Current Focus
{What you're actively working on}

## Next Actions
- [ ] {Action items — checkboxes drive progress %}

## Accomplishments
{Timestamped entries: [YYYY-MM-DD HH:MM] Completed X}

## Blockers
None

## Notes
{Observations, context}

## Links
{Related PRs, docs, resources}

## Decisions
{Key decisions made during work}
```

**Progress auto-calculation:** Percentage computed from Next Actions checkboxes (`[x]` / total).

### CLAUDE.md
```markdown
# Task: {title} #id:{id}
Priority: {priority} | Created: {date}

## Context
{context from task.md}

## Auto-Update Rule
UPDATE PROGRESS.md at these checkpoints:
- Significant code changes committed
- Major milestone reached
- Blocker encountered or resolved
- Before ending session
Format: Append to relevant section with timestamp [YYYY-MM-DD HH:MM]

## Session Start Rule
ALWAYS re-read PLAN.md and PROGRESS.md before starting any work.
Check for user edits made via Obsidian since last session.
```

### dashboard.md
```markdown
# Workspace

> Last updated: YYYY-MM-DD HH:MM PST

## Active Tasks

| Task | Priority | Due | State | Next Action |
|------|----------|-----|-------|-------------|
| [Task title](active/{id}/PROGRESS.md) | P0 | Feb 10 | In Progress | Write tests |

## This Week
- Completed: N tasks
- In progress: N tasks
- [Weekly summary →](weeks/YYYY-MM-DD.md)
```

Regenerated (not appended) after: create, done, update-metadata.

### Weekly Summary (weeks/YYYY-MM-DD.md)
```markdown
# Week of {Month Day, Year}

## Completed ({N} tasks)

### [P0] {Task title} [id:{id}](../archive/{id}/PROGRESS.md)
**Completed:** YYYY-MM-DD | **Duration:** {days} days
{Key accomplishments from PROGRESS.md}

## Stats
- Tasks completed: N
- By priority: N× P0, N× P1, N× P2
```

## Natural Language Examples

### Creating Tasks
```bash
/task create fix login bug, urgent, due tomorrow
/task add API documentation, p2, due friday
/task new research caching strategies, low priority
/task create deploy pipeline, p1, needs CI/CD setup and staging tests
```

### Listing & Reviewing
```bash
/task list
/task show tasks
/task review
/task what's overdue?
```

### Opening Tasks
```bash
/task open abc123
/task work on the auth bug
/task open first task
```

### Completing Tasks
```bash
/task done abc123
/task complete the auth bug
/task finish first task
```

### Updating
```bash
/task update abc123 priority to p0
/task change due date to next monday
/task update progress: finished writing tests, moving to integration
```

### Planning
```bash
/task plan abc123
/task plan the auth bug
```

## Priority Levels

| Level | Keywords | Description |
|-------|----------|-------------|
| **p0** | critical, urgent | Must do immediately |
| **p1** | high, important | Do soon |
| **p2** | medium (default) | Normal priority |
| **p3** | low, nice-to-have | When time allows |

## Session Rules

1. **Session start:** Re-read PLAN.md and PROGRESS.md. Check for Obsidian edits.
2. **During work:** Update PROGRESS.md at milestones, blockers, and before ending.
3. **Session end:** Update Status block with summary and next action.

## Obsidian Integration

Open `workspace-data/` as an Obsidian vault:
- `dashboard.md` is the canonical dashboard view
- Navigate to tasks via links: `[Task title](active/{id}/PROGRESS.md)`
- Edit PLAN.md to co-author plans with Claude
- Monitor PROGRESS.md for status updates
- Browse weekly summaries in `weeks/`

The `.obsidian/` config directory is gitignored.

## Common Workflows

### Bug Investigation
```bash
/task create investigate login timeout, p0, due today
/task open login timeout
# Work in active/{id}/docs/ for analysis, logs/ for traces
/task done login timeout
```

### Feature Development
```bash
/task create add user profiles, p1, due next friday
/task plan user profiles     # co-author PLAN.md
/task open user profiles     # start working
# Update progress as you go
/task done user profiles
```

### Research
```bash
/task create research caching strategies, p2
/task open caching research
# Use docs/ for findings, scratch/ for experiments
/task update progress: evaluated Redis vs Memcached
/task done caching research
```
