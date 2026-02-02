---
title: TODO Management
description: Natural language task management system
user-invocable: true
args:
  - name: command
    description: Natural language task command
    type: string
    required: false
---

Manage tasks via natural language. Config: `~/.claude/workspace-path.txt` → WORKSPACE_DATA_DIR

## Command: {{command}}

**Intents:** create/add/new | list/show | done/complete | update/change | review/status | help

## Operations

**CREATE** → Generate 6-char ID, parse priority (p0-p3/urgent/high/medium/low), dates (tomorrow/friday/"feb 15"/"in 3 days"), context. Format:
```
- [ ] Title #id:abc123
  - priority: p2
  - created: YYYY-MM-DD
  - due: YYYY-MM-DD
  - tags: [tag1]
  - context: Details
```

**Status (automatic):**
- **Not Started** (gray): No workspace created for task
- **Ongoing** (blue): Workspace exists at `workspace/{id}/`
- **Finished** (green): Task archived, workspace moved to `workspace/archive/{id}/`

**Auto-context:** When no context provided, generate based on title keywords:
- "bug/fix/issue/error" → "Investigate and resolve the issue"
- "add/implement/create/build" → "Implement and test the feature"
- "review/check" → "Review and provide feedback"
- "update/change/modify" → "Update the existing implementation"
- "test/verify" → "Write and run tests to verify functionality"
- "document/docs" → "Write or update documentation"
- Default → "Complete the task as described"

**LIST** → Read `active.md`, sort: overdue → due → priority → created. Format: "1. [P1] Title (due: date) [status] #id"

**COMPLETE** → Match by number/description/ID. Before archiving:
1. If workspace exists at `workspace/{id}/`:
   - Run `/workspace summarize` to update PROGRESS.md with final accomplishments
   - Read accomplishments section
   - Summarize key steps/solutions (1-2 sentences)
   - Append summary to task context
2. Move task to `archive/YYYY-MM-DD.md` with `- completed: YYYY-MM-DD`
3. If workspace exists, move `workspace/{id}/` to `workspace/archive/{id}/`

**UPDATE** → Modify priority/due/title/context/tags in active.md

**REVIEW** → Count by priority and status, alert overdue, show due this week

**HELP** → Read `modules/todo/README.md` via Task tool

## Paths
- Active: `WORKSPACE_DATA_DIR/todo/active.md`
- Archive: `WORKSPACE_DATA_DIR/todo/archive/YYYY-MM-DD.md`

**Errors:** No config → run bootstrap | No task → show list | Ambiguous → ask clarification
