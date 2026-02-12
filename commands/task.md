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
├── dashboard.md                ← auto-generated canonical view
├── active/
│   └── {task-id}/
│       ├── task.md             ← metadata (priority, due, tags, context)
│       ├── PLAN.md
│       ├── PROGRESS.md
│       ├── CLAUDE.md
│       ├── docs/
│       ├── logs/
│       └── scratch/
├── archive/
│   └── {task-id}/              ← same structure as active
└── weeks/
    └── 2026-02-03.md           ← weekly summary (Monday date)
```

## Operations

**CREATE** → Generate 6-char ID, parse priority (p0-p3/urgent/high/medium/low), dates (tomorrow/friday/"feb 15"/"in 3 days"), context. Create `active/{id}/` with: task.md, PLAN.md, PROGRESS.md, CLAUDE.md, docs/, logs/, scratch/. Regenerate dashboard.md.

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

**PLAN.md template:** (only written after interactive planning is finalized)
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

2. **{Step title}**
   - What: ...
   - Where: ...
   - How: ...
   - Done when: ...

## Design
{Technical details, architecture decisions — if applicable}

## Decisions
| Date | Decision | Rationale |
|------|----------|-----------|
```

**Plan quality bar:** A new Claude session reading only PLAN.md + task.md + CLAUDE.md should be able to execute the plan without asking clarifying questions. Each step must specify what to do, where to do it, how to do it, and how to verify it's done.

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

**LIST** → Read `dashboard.md` and display active tasks. Sort: overdue → due → priority → created. Format: numbered list with priority, title, due date, state, next action.

**OPEN** → Resolve task ID (by number/description/ID). Switch context to task:
1. Read `active/{id}/CLAUDE.md` for context
2. Re-read `active/{id}/PLAN.md` and `active/{id}/PROGRESS.md`
3. Check for user edits made via Obsidian since last session

**DONE** → Match by number/description/ID. Before archiving:
1. Update PROGRESS.md with final summary in Accomplishments
2. Set State to "Done" in Status block
3. Add `- **completed**: YYYY-MM-DD` to task.md, add summary to Context
4. Move `active/{id}/` → `archive/{id}/`
5. Append to weekly summary (`weeks/YYYY-MM-DD.md`, Monday date)
6. Regenerate dashboard.md

**UPDATE** → Auto-detect intent from input:
- Metadata changes (priority/due/tags) → update task.md, regenerate dashboard.md
- Session progress → update PROGRESS.md (add accomplishments, update current focus, revise next actions, note blockers)

**PLAN** → Interactive planning for `active/{id}/PLAN.md`:
1. Read task.md for context and existing PLAN.md if any
2. Ask clarifying questions to understand scope, constraints, and priorities — don't assume
3. Research: explore relevant code, files, and dependencies to ground the plan in reality
4. Draft a plan with detailed, executable steps (see template above for required structure)
5. Present the plan to the user for feedback
6. Iterate — refine based on user input until the plan is approved
7. Write the finalized plan to PLAN.md
8. Update PROGRESS.md Next Actions with the plan's steps as checkboxes

**Quality bar:** The finalized PLAN.md must be a standalone execution document. A new Claude session or another AI agent reading PLAN.md + task.md + CLAUDE.md should be able to execute without asking clarifying questions. Every step must have: what, where, how, and done-when.

**REVIEW** → Full scan and sync. Scan all `active/*/task.md` + `active/*/PROGRESS.md` to build fresh state. Regenerate `dashboard.md`. Then display: count by priority, overdue alerts, this week's completions, link to weekly summary. Use this to fix stale dashboard or after manual Obsidian edits.

**HELP** → Read `modules/task/README.md` via Task tool

## dashboard.md Generation

Regenerate (not append) after: create, done, update-metadata. Build by scanning `active/*/task.md` + reading State from each `PROGRESS.md` Status block.

**dashboard.md template:**
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

## Weekly Summary

File: `weeks/YYYY-MM-DD.md` (Monday date of the week)

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

## Paths
- Active: `WORKSPACE_DATA_DIR/active/{task-id}/`
- Archive: `WORKSPACE_DATA_DIR/archive/{task-id}/`
- Weekly: `WORKSPACE_DATA_DIR/weeks/`
- Dashboard: `WORKSPACE_DATA_DIR/dashboard.md`

**Errors:** No config → run bootstrap | No task → show list | Ambiguous → ask clarification
