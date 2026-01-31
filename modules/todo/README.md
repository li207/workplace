# TODO Module

A simple, markdown-based task management system.

## Overview

Tasks are stored in markdown files within `workplace-data/todo/`. Each task is a checkbox list item with metadata stored as nested bullet points.

## File Organization

| File | Purpose |
|------|---------|
| `inbox.md` | New tasks without a scheduled date |
| `today.md` | Tasks to focus on today |
| `upcoming.md` | Tasks scheduled for future dates |
| `archive/YYYY-MM-DD.md` | Completed tasks, organized by completion date |

## Data Format

### Active Task
```markdown
- [ ] Write project proposal #id:a1b2c3
  - priority: high
  - due: 2026-02-01
  - created: 2026-01-30
  - tags: [work, writing]
  - notes: Include budget section
```

### Completed Task
```markdown
- [x] Review pull request #id:d4e5f6
  - priority: medium
  - due: 2026-01-29
  - created: 2026-01-28
  - completed: 2026-01-29
  - tags: [code]
```

## Fields

| Field | Required | Description |
|-------|----------|-------------|
| `#id:` | Yes | Unique 6-char identifier (in task title) |
| `priority` | No | `high`, `medium`, `low` (default: medium) |
| `due` | No | Due date in YYYY-MM-DD format |
| `created` | Yes | Creation date in YYYY-MM-DD format |
| `completed` | On completion | Completion date |
| `tags` | No | Array of tags for categorization |
| `notes` | No | Additional context or details |

## Operations

### Add Task
Create a new task in inbox (or today/upcoming if date specified).

**Usage:** `todo add "<description>" [--priority <level>] [--due <date>] [--tags <tag1,tag2>]`

**Examples:**
```
todo add "Buy groceries"
todo add "Submit report" --priority high --due 2026-02-01
todo add "Call dentist" --tags health,personal
```

### List Tasks
Display active tasks. By default shows all active tasks from all files.

**Usage:** `todo list [inbox|today|upcoming|all]`

**Behavior:**
- `todo list` or `todo list all` - Show all active tasks from inbox, today, and upcoming
- `todo list <file>` - Show tasks from specific file only
- Completed tasks are not shown (they're in archive files)

**Output format:**
```
## Active Tasks (5 tasks)

### Today (2 tasks)
- [ ] [HIGH] Submit report (due: today) #id:a1b2c3
- [ ] Review PR #id:d4e5f6

### Inbox (3 tasks)
- [ ] [LOW] Clean desk #id:g7h8i9
- [ ] Buy groceries #id:h1i2j3
- [ ] Call dentist #id:k4l5m6
```

### Complete Task
Mark a task as done and move to archive.

**Usage:** `todo done "<description or id>"`

**Examples:**
```
todo done "a1b2c3"
todo done "Buy groceries"
```

### Move Task
Move a task between lists.

**Usage:** `todo move <id> <destination>`

**Examples:**
```
todo move a1b2c3 today
todo move d4e5f6 upcoming
```

### Review
Show overdue tasks and today's agenda.

**Usage:** `todo review`

**Output:**
```
## ⚠️ Overdue (1 task)
- [ ] [HIGH] Submit report (due: 2026-01-28) #id:a1b2c3

## Today (2 tasks)
- [ ] Review PR #id:d4e5f6
- [ ] Call dentist #id:g7h8i9

## Upcoming (3 tasks in next 7 days)
...
```

## Daily Workflow

1. **Morning:** Run `todo review` to see what needs attention
2. **During day:** Add tasks with `todo add`, complete with `todo done`
3. **End of day:** Move incomplete items to tomorrow or upcoming

## Archiving

When a task is completed:
1. Add `completed: YYYY-MM-DD` field
2. Change `- [ ]` to `- [x]`
3. Move to `archive/YYYY-MM-DD.md` (based on completion date)
