# Workspace Framework

Personal task management with natural language commands.

## Commands

| Command | Purpose |
|---------|---------|
| `/todo` | Task management (create, list, complete, review) |
| `/workspace` | Task-specific isolated environments |
| `/visual` | Real-time dashboard visualization |

## Data Paths

- **Config**: `~/.claude/workspace-path.txt` → WORKSPACE_DATA_DIR
- **Tasks**: `WORKSPACE_DATA_DIR/todo/active.md`
- **Archive**: `WORKSPACE_DATA_DIR/todo/archive/YYYY-MM-DD.md`
- **Workspaces**: `WORKSPACE_DATA_DIR/workspace/{task-id}/`
- **Obsidian vault**: `workspace-data/` (open as vault root)

## Task Format

```markdown
- [ ] Task title #id:abc123
  - priority: p0|p1|p2|p3
  - created: YYYY-MM-DD
  - due: YYYY-MM-DD
  - tags: [tag1, tag2]
  - context: Details, requirements, notes
```

## Quick Examples

```bash
/todo create fix auth bug, urgent, due tomorrow
/todo list
/todo mark first task as done
/todo review

/workspace create for task abc123  # creates README, CLAUDE.md, PLAN.md, PROGRESS.md
/workspace status
/workspace summarize

/visual start
```

## Reference

- Full docs: `instructions.md`
- Module specs: `modules/{name}/README.md`
- Extension guide: `EXTENDING.md`
