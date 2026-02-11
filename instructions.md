# Workspace Framework Reference

Detailed reference for the workspace system. See `CLAUDE.md` for quick overview.

## Directory Structure

```
workspace/                          # Framework (shareable)
├── commands/                       # Global commands → ~/.claude/commands/
│   ├── task.md
│   └── visual.md
├── modules/                        # Module specs
│   ├── task/README.md
│   └── visual/README.md
└── workspace-data/                 # Private data (gitignored)
    ├── index.md                    # Auto-generated canonical view
    ├── active/
    │   └── {task-id}/
    │       ├── task.md
    │       ├── PLAN.md
    │       ├── PROGRESS.md
    │       ├── CLAUDE.md
    │       ├── docs/
    │       ├── logs/
    │       └── scratch/
    └── archive/
        ├── {task-id}/
        └── weeks/
```

## Command Details

### /task
Unified task and workspace management via natural language.

**Intents:** create | list | open | done/complete | update | plan | review | help

**Creates per task:** `active/{id}/` with task.md, PLAN.md, PROGRESS.md, CLAUDE.md, docs/, logs/, scratch/

**Parsing:**
- Priorities: urgent/critical → p0, high → p1, medium → p2, low → p3
- Dates: tomorrow, friday, "feb 15", "next monday", "in 3 days"
- Context: Everything after main task description

### /visual
Dashboard visualization server.

**Intents:** start | stop | status | open | (default: start + open)

## Data Formats

### task.md
```markdown
# Task title
- **id**: abc123
- **priority**: p1
- **created**: 2026-01-31
- **due**: 2026-02-02
- **tags**: [security, backend]

## Context
Requirements and notes
```

When completing: add `- **completed**: YYYY-MM-DD` and summary to Context.

### index.md
```markdown
# Workspace

> Last updated: 2026-02-10 14:30 PST

## Active Tasks

| Task | Priority | Due | State | Next Action |
|------|----------|-----|-------|-------------|
| [Fix auth bug](active/abc123/) | P0 | Feb 10 | In Progress | Write tests |

## This Week
- Completed: 3 tasks
- In progress: 2 tasks
- [Weekly summary →](archive/weeks/2026-02-03.md)
```

Regenerated after: create, done, update-metadata. Built by scanning `active/*/task.md` + reading State from each `PROGRESS.md`.

### Weekly Summary (archive/weeks/YYYY-MM-DD.md)
```markdown
# Week of Feb 3, 2026

## Completed (3 tasks)

### [P0] Fix critical auth bug #id:abc123
**Completed:** 2026-02-05 | **Duration:** 3 days
Key accomplishments from PROGRESS.md

## Stats
- Tasks completed: 3
- By priority: 1× P0, 1× P1, 1× P2
```

### PLAN.md
```markdown
# Plan: {task-title}

## Objective
{What this task aims to accomplish}

## Approach
{High-level strategy — Claude drafts, user reviews}

## Design
{Technical details, architecture decisions}

## Open Questions
{Unresolved items needing user input}

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
```

**Co-authoring workflow:** Claude drafts the plan during task creation. The user reviews and edits via Obsidian. Claude re-reads PLAN.md at session start to pick up changes.

### PROGRESS.md
```markdown
# Progress: {task-title}

## Status
- **State**: Not Started | In Progress | Blocked | Ready for Review | Done
- **Branch**: {git branch if applicable}
- **Last session**: YYYY-MM-DD HH:MM
- **Summary**: {One-line summary of current state}
- **Next action**: {Single most important next step}
- **Blocked on**: {Blocker or "Nothing"}

## Accomplishments
- [YYYY-MM-DD HH:MM] Completed X

## Current Focus
Working on Y

## Next Actions
- [ ] Do Z

## Blockers
None
```

**Progress auto-calculation:** Percentage computed from Next Actions checkboxes (`[x]` / total).

### Session Start Rules

At the beginning of each task session, Claude must:
1. Re-read PLAN.md and PROGRESS.md before starting any work
2. Check for user edits made via Obsidian since the last session
3. Update the Status block's "Last session" timestamp

### Obsidian Vault

The `workspace-data/` directory is designed to function as an Obsidian vault root. Open it as a vault in Obsidian to review plans, track progress, and co-author with Claude. The `index.md` file is the canonical entry point. The `.obsidian/` directory is gitignored.

## Extension Pattern

### Adding Commands
1. Create `commands/name.md` with frontmatter and processing logic
2. Run `./bootstrap.sh` to install to `~/.claude/commands/`

### Adding Modules
1. Create `modules/name/README.md` with specs
2. Create storage in `workspace-data/` as needed
3. Optional: Create matching command

## ID Generation

6-character alphanumeric: `#id:abc123`
Generated from timestamp + content hash.
