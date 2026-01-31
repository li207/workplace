# Claude Code Configuration

This file provides context and shortcuts for Claude Code CLI sessions.

## Quick Reference

Read `instructions.md` first for full system context.

## Common Commands

### TODO Operations
```
# Add task
todo add "Task description" --priority high --due 2026-02-01

# List tasks
todo list today
todo list upcoming
todo list all

# Complete task
todo done "task description or id"

# Move task
todo move <id> today
todo move <id> upcoming

# Review (overdue + today)
todo review
```

## File Locations

- **Framework docs**: `/modules/`
- **Personal data**: `/data/` (private)
- **Skills**: `/.skills/`

## Session Startup

When starting a session in this workspace:
1. Read `instructions.md` for context
2. Check `data/todo/today.md` for current tasks
3. Run `todo review` to see what needs attention

## Data Format Conventions

### TODO items
```markdown
- [ ] Task description #id:abc123
  - priority: high|medium|low
  - due: YYYY-MM-DD
  - created: YYYY-MM-DD
  - tags: [tag1, tag2]
```

### Completed items (in archive)
```markdown
- [x] Task description #id:abc123
  - completed: YYYY-MM-DD
  - priority: medium
  - due: 2026-01-30
  - created: 2026-01-28
```

## ID Generation

Use 6-character alphanumeric IDs for tasks: `#id:abc123`
Generate with: first 6 chars of md5/sha hash of timestamp + task text, or random.
