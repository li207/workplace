---
title: Task Management
description: Unified task and workspace management
user-invocable: true
args:
  - name: command
    description: Natural language task command
    type: string
    required: false
---

Manage tasks via natural language. Config: `~/.claude/workspace-path.txt` → WORKSPACE_DATA_DIR

**Timezone: All dates must be calculated in PST (America/Los_Angeles). When resolving relative dates like "tomorrow", "friday", "in 3 days", use the current time in PST to determine the correct date.**

## Command: {{command}}

**Intents:** create/add/new | list/show | open/"work on" | done/complete | update/change | plan | review/status | help

## Data Layout

```
workspace-data/
├── index.md                    ← auto-generated canonical view
├── active/
│   └── {task-id}/
│       ├── task.md             ← metadata (priority, due, tags, context)
│       ├── PLAN.md
│       ├── PROGRESS.md
│       ├── CLAUDE.md
│       ├── docs/
│       ├── logs/
│       └── scratch/
└── archive/
    ├── {task-id}/              ← same structure as active
    └── weeks/
        └── 2026-02-03.md       ← weekly summary (Monday date)
```

## Operations

**CREATE** → Generate 6-char ID, parse priority (p0-p3/urgent/high/medium/low), dates (tomorrow/friday/"feb 15"/"in 3 days"), context. Create `active/{id}/` with: task.md, PLAN.md, PROGRESS.md, CLAUDE.md, docs/, logs/, scratch/. Regenerate index.md.

**task.md template:**
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

**Auto-context:** When no context provided, generate based on title keywords:
- "bug/fix/issue/error" → "Investigate and resolve the issue"
- "add/implement/create/build" → "Implement and test the feature"
- "review/check" → "Review and provide feedback"
- "update/change/modify" → "Update the existing implementation"
- "test/verify" → "Write and run tests to verify functionality"
- "document/docs" → "Write or update documentation"
- "read/study/learn" → "Read and study the material thoroughly"
- Default → "Complete the task as described"

**CLAUDE.md template:**
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

**PLAN.md template:**
```markdown
# Plan: {title}

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

**PROGRESS.md template:**
```markdown
# Progress: {title}

## Status
- **State**: Not Started
- **Branch**: {git branch if applicable}
- **Last session**: {date}
- **Summary**: Workspace created
- **Next action**: Review PLAN.md and define approach
- **Blocked on**: Nothing

## Current Focus
{What you're currently working on}

## Next Actions
- [ ] {First action item}
- [ ] {Second action item}
- [ ] {Third action item}

## Accomplishments
{Timestamped entries will be added here as work progresses}

## Blockers
None

## Notes
{General observations, thoughts, context}

## Links
{Related PRs, docs, resources}

## Decisions
{Key decisions made during this work}
```

**Progress Calculation:** Progress percentage is auto-calculated from Next Actions checkboxes. Count `[x]` completed vs total checkboxes.

**LIST** → Read `index.md` (or scan `active/*/task.md`), sort: overdue → due → priority → created. Format: numbered list with priority, title, due date, state, next action.

**OPEN** → Resolve task ID (by number/description/ID). Switch context to task:
1. Read `active/{id}/CLAUDE.md` for context
2. Re-read `active/{id}/PLAN.md` and `active/{id}/PROGRESS.md`
3. Check for user edits made via Obsidian since last session

**DONE** → Match by number/description/ID. Before archiving:
1. Update PROGRESS.md with final summary in Accomplishments
2. Set State to "Done" in Status block
3. Add `- **completed**: YYYY-MM-DD` to task.md, add summary to Context
4. Move `active/{id}/` → `archive/{id}/`
5. Append to weekly summary (`archive/weeks/YYYY-MM-DD.md`, Monday date)
6. Regenerate index.md

**UPDATE** → Auto-detect intent from input:
- Metadata changes (priority/due/tags) → update task.md, regenerate index.md
- Session progress → update PROGRESS.md (add accomplishments, update current focus, revise next actions, note blockers)

**PLAN** → Co-author `active/{id}/PLAN.md`:
- Claude drafts or updates the plan
- User reviews and edits via Obsidian
- Claude re-reads at session start to pick up changes

**REVIEW** → Overview: count by priority, overdue alerts, this week's completions, link to weekly summary

**HELP** → Read `modules/task/README.md` via Task tool

## index.md Generation

Regenerate (not append) after: create, done, update-metadata. Build by scanning `active/*/task.md` + reading State from each `PROGRESS.md` Status block.

**index.md template:**
```markdown
# Workspace

> Last updated: YYYY-MM-DD HH:MM PST

## Active Tasks

| Task | Priority | Due | State | Next Action |
|------|----------|-----|-------|-------------|
| [Task title](active/{id}/) | P0 | Feb 10 | In Progress | Write tests |

## This Week
- Completed: N tasks
- In progress: N tasks
- [Weekly summary →](archive/weeks/YYYY-MM-DD.md)
```

## Weekly Summary

File: `archive/weeks/YYYY-MM-DD.md` (Monday date of the week)

```markdown
# Week of {Month Day, Year}

## Completed ({N} tasks)

### [P0] {Task title} #id:{id}
**Completed:** YYYY-MM-DD | **Duration:** {days} days
{Key accomplishments from PROGRESS.md}

## Stats
- Tasks completed: N
- By priority: N× P0, N× P1, N× P2
```

## Paths
- Active: `WORKSPACE_DATA_DIR/active/{task-id}/`
- Archive: `WORKSPACE_DATA_DIR/archive/{task-id}/`
- Weekly: `WORKSPACE_DATA_DIR/archive/weeks/`
- Index: `WORKSPACE_DATA_DIR/index.md`

**Errors:** No config → run bootstrap | No task → show list | Ambiguous → ask clarification
