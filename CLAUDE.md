# Workspace Framework

Personal task management with natural language commands.

## Commands

| Command | Purpose |
|---------|---------|
| `/task` | Unified task & workspace management (create, list, open, done, update, plan, review) |
| `/visual` | Real-time dashboard visualization |

## Data Paths

- **Config**: `~/.claude/workspace-path.txt` → WORKSPACE_DATA_DIR
- **Index**: `WORKSPACE_DATA_DIR/dashboard.md`
- **Active tasks**: `WORKSPACE_DATA_DIR/active/{task-id}/`
- **Archive**: `WORKSPACE_DATA_DIR/archive/{task-id}/`
- **Weekly summaries**: `WORKSPACE_DATA_DIR/weeks/`
- **Obsidian vault**: `workspace-data/` (open as vault root, dashboard.md is entry point)

## Task Folder Structure

```
active/{task-id}/
├── task.md             ← metadata (priority, due, tags, context)
├── PLAN.md
├── PROGRESS.md
├── CLAUDE.md
├── docs/
├── logs/
└── scratch/
```

## Quick Examples

```bash
/task create fix auth bug, urgent, due tomorrow
/task list
/task open first task
/task done auth bug
/task review

/visual start
```

## Reference

- Full docs: `instructions.md`
- Module specs: `modules/{name}/README.md`
- Extension guide: `EXTENDING.md`
