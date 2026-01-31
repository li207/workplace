# Claude Code Configuration

Quick reference for Claude Code CLI sessions in the Workplace framework.

## Quick Reference

Read `instructions.md` first for full system context and extensibility patterns.

## Natural Language TODO Commands

The TODO system uses conversational commands that work from anywhere:

### Creating Tasks
```bash
# Natural language creation
/todo create API integration task, urgent, due tomorrow
/todo add client meeting friday, high priority
/todo new security audit, reference OWASP guidelines

# System understands:
# - Priorities: urgent/critical → high, important → medium, minor → low
# - Dates: tomorrow, friday, "feb 15", "next monday", "in 3 days"
# - Context: Everything after the main task becomes detailed context
```

### Managing Tasks
```bash
# Viewing tasks (numbered for easy reference)
/todo list                          # All active tasks, sorted intelligently
/todo review                        # Summary with overdue alerts
/todo what's due this week?         # Smart filtering

# Completing tasks
/todo mark first task as done       # By position
/todo complete the auth bug         # By description
/todo done abc123                   # By ID

# Updating tasks
/todo change task 2 to high priority
/todo move deadline to next monday
/todo add context to first task: needs manager approval
```

### Getting Help
```bash
/todo help                          # Complete natural language guide
```

## File Locations

- **Framework docs**: `/modules/`
- **Personal data**: `/workplace-data/` (private, gitignored)
- **Global commands**: `/commands/` → `~/.claude/commands/`
- **Skills**: `/.skills/`

## Session Startup

When starting a session in this workspace:
1. Read `instructions.md` for full context and extension patterns
2. Check `workplace-data/todo/active.md` for current tasks
3. Run `/todo review` to see what needs attention
4. Explore `/todo help` for natural language examples

## Enhanced Data Format

### Active Tasks
```markdown
- [ ] Clean, actionable task title #id:abc123
  - priority: high
  - created: 2026-01-31
  - due: 2026-02-02
  - tags: [security, backend]
  - context: Detailed requirements, links, coordination notes, POC details
```

### Completed Tasks (in archive)
```markdown
- [x] Completed task title #id:abc123
  - priority: medium
  - created: 2026-01-30
  - due: 2026-01-31
  - completed: 2026-01-31
  - tags: [feature, frontend]
  - context: Implementation notes, lessons learned, follow-up items
```

## Extensibility

### Adding Commands
1. Create `commands/command-name.md` with natural language processing
2. Bootstrap installs to `~/.claude/commands/`
3. Available globally as `/command-name`

### Adding Modules  
1. Document in `modules/module-name/README.md`
2. Store data in `workplace-data/module-name/`
3. Optional: Create global commands and skills

### Future Commands
Potential natural language commands:
- `/note` — Knowledge management with linking
- `/cal` — Schedule and meeting management
- `/project` — Multi-task project tracking
- `/journal` — Daily reflection and logging

## ID Generation

Use 6-character alphanumeric IDs for tasks: `#id:abc123`
Auto-generated from timestamp + task hash for uniqueness.