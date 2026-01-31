# TODO Module

A simple, markdown-based task management system focused on active work.

## Overview

Tasks are stored in markdown files within `workplace-data/todo/`. The system maintains a clean separation between active tasks and completed tasks.

## File Organization

| File | Purpose |
|------|---------|
| `active.md` | Tasks currently being worked on |
| `archive/YYYY-MM-DD.md` | Completed tasks, organized by completion date |

## Data Format

### Active Task
```markdown
- [ ] Write comprehensive project proposal #id:a1b2c3
  - priority: high
  - created: 2026-01-30
  - due: 2026-02-15
  - tags: [work, writing]
  - context: Include budget breakdown, timeline, resource requirements. Reference previous proposals in /docs/proposals. Need approval from PM and stakeholders.
```

### Completed Task
```markdown
- [x] Review pull request #id:d4e5f6
  - priority: medium
  - created: 2026-01-28
  - due: 2026-01-30
  - completed: 2026-01-29
  - tags: [code]
  - context: Focused on security improvements and performance optimizations. All tests passing.
```

## Fields

| Field | Required | Description |
|-------|----------|-------------|
| `#id:` | Yes | Unique 6-char identifier (in task title) |
| `priority` | No | `high`, `medium`, `low` (default: medium) |
| `created` | Yes | Creation date in YYYY-MM-DD format |
| `due` | No | Due date in YYYY-MM-DD format |
| `completed` | On completion | Completion date |
| `tags` | No | Array of tags for categorization |
| `context` | No | Additional details, requirements, links, notes |

## Operations

### Add Task
Create a new task using natural language.

**Natural Language Usage:**
- Use simple, conversational commands
- System automatically extracts priority, due dates, and context
- Task titles are cleaned and organized for clarity

**Examples:**
```bash
# Basic task creation
todo create bug fix task
todo add meeting with client
todo new task: update documentation

# With natural priority
todo create urgent security fix for login system
todo add important client presentation, high priority  
todo make low priority task to organize files

# With flexible due dates
todo create report task due tomorrow
todo add client meeting this friday
todo new bug fix due next monday
todo add presentation task, due feb 15th

# With rich context
todo create API integration task, urgent, needs database migration and team review
todo add client demo preparation, include performance metrics and new features overview
todo new security audit, reference OWASP guidelines and document findings in /docs/security

# Complex natural language
todo create authentication system overhaul, critical priority, due end of sprint, requires coordination with DevOps team and security review
```

**What gets organized:**
- **Title**: "create authentication system overhaul" → "Overhaul authentication system"
- **Priority**: "critical", "urgent" → high; "important" → medium; "low priority" → low  
- **Due dates**: "tomorrow", "friday", "feb 15th", "end of sprint" → parsed dates
- **Context**: Everything after commas gets extracted to context field
- **Tags**: Auto-detected from context (security, api, etc.)

### List Tasks
Display all active tasks.

**Usage:** `todo list`

**Output format:**
```
## Active Tasks (3 tasks)

- [ ] [HIGH] Submit quarterly report #id:a1b2c3
- [ ] [MEDIUM] Buy groceries for the week #id:d4e5f6
- [ ] [MEDIUM] Call dentist to schedule checkup #id:g7h8i9
```

### Complete Task
Mark a task as done and move to archive.

**Usage:** `todo done "<description or id>"`

**Examples:**
```
todo done "a1b2c3"
todo done "Buy groceries"
```

### Review
Show summary of active tasks.

**Usage:** `todo review`

**Output:**
```
## Task Summary
- Total active tasks: 3
- High priority: 1
- Medium priority: 2
- Low priority: 0

## Oldest Tasks (need attention)
- [ ] [HIGH] Submit quarterly report (created: 5 days ago) #id:a1b2c3
```

### Help
Display comprehensive command manual with examples.

**Usage:** `todo help`

**Shows:**
- All available operations with examples
- Data format specifications
- Daily workflow tips
- File locations and configuration details

## Daily Workflow

1. **Morning:** Run `todo review` to see active task summary
2. **During day:** Add tasks with `todo add`, complete with `todo done`
3. **Focus:** Work on active tasks, keeping the list manageable

## Archiving

When a task is completed:
1. Add `completed: YYYY-MM-DD` field
2. Change `- [ ]` to `- [x]`
3. Move to `archive/YYYY-MM-DD.md` (based on completion date)
4. Remove from `active.md`
