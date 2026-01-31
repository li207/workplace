# Workplace - Intelligent Workspace Framework

An extensible, Claude-native workspace system featuring natural language processing and modular architecture.

## Core Principles

1. **Natural Language Processing** — Commands understand conversational intent, not rigid syntax
2. **File-based Storage** — All data in human-readable markdown files
3. **Privacy by Design** — Personal data completely separated from framework
4. **Modular Architecture** — Commands, modules, and skills extend functionality independently  
5. **Multi-User Ready** — Share framework, keep data private
6. **Claude-Native** — Built specifically for Claude AI workflows

## Directory Structure

```
workplace/                          # 🔓 Framework Repository (shareable)
├── instructions.md                 # This file - master context for Claude
├── CLAUDE.md                       # Claude Code shortcuts
├── README.md                       # Public documentation
├── bootstrap.sh                    # Setup script
├── .gitignore                      # Excludes private data
│
├── commands/                       # Global Claude commands
│   └── todo.md                    # Natural language TODO processor
│
├── modules/                        # Module specifications
│   ├── todo/                      # TODO module definition
│   │   └── README.md
│   └── [future-modules]/          # Notes, calendar, projects, etc.
│
├── .skills/                        # Custom Claude skills (optional)
│   ├── todo/
│   │   └── SKILL.md
│   └── [future-skills]/
│
├── scripts/                        # Automation utilities
│   ├── bootstrap.sh               # Moved to root
│   └── sync.sh                    # Dual-repo syncing
│
└── workplace-data/                 # 🔒 Private Data Repository (gitignored)
    ├── todo/                       # Task management data
    │   ├── active.md              # Current tasks with context
    │   └── archive/               # Completed tasks by date
    │       └── 2026-01-31.md
    │
    └── [future-data]/              # Notes, calendar, projects, etc.
```

## Active Commands

### 🗣️ Natural Language TODO (`/todo`)
**Location**: Global command - works from anywhere
**Processor**: `commands/todo.md`
**Data**: `workplace-data/todo/`

**Natural Language Examples:**
```bash
# Creating tasks
/todo create API integration task, urgent, due tomorrow
/todo add client meeting friday, needs budget discussion
/todo new security audit, reference OWASP guidelines

# Managing tasks
/todo list                          # Numbered task display  
/todo mark first task as done       # Complete by position
/todo change task 2 to high priority # Update by reference
/todo what's overdue?               # Smart filtering

# Getting insights  
/todo review                        # Summary with alerts
/todo show my current workload      # Status overview
```

**Enhanced Data Format:**
```markdown
- [ ] Clean, actionable task title #id:abc123
  - priority: high
  - created: 2026-01-31
  - due: 2026-02-02
  - tags: [security, backend]
  - context: Detailed requirements, links to docs, coordination notes, POC details
```

## Extension Patterns

### Adding Commands (Global Claude Commands)
1. **Create**: `commands/command-name.md` with natural language processing
2. **Install**: Bootstrap copies to `~/.claude/commands/`
3. **Use**: Available globally as `/command-name`

**Command Template:**
```markdown
---
title: Command Name
description: Natural language command processor
user-invocable: true
args:
  - name: command
    description: Natural language input
    type: string
    required: true
---

[Natural language processing logic here]
```

### Adding Modules (Feature Specifications)
1. **Document**: `modules/module-name/README.md` with:
   - Purpose and use cases
   - Data format specifications  
   - Natural language patterns
   - Integration guidelines

2. **Data Structure**: `workplace-data/module-name/` for storage
3. **Commands**: Optional global commands in `commands/`
4. **Skills**: Optional specialized skills in `.skills/`

### Adding Skills (Claude Capabilities)  
1. **Create**: `.skills/skill-name/SKILL.md`
2. **Activate**: Reference in this instructions.md
3. **Scope**: Context-specific Claude behaviors

## Future Extensions

### Potential Modules
- **Notes** (`/note`) — Knowledge management with linking
- **Calendar** (`/cal`) — Schedule and meeting management  
- **Projects** (`/project`) — Multi-task project tracking
- **Journal** (`/journal`) — Daily reflection and logging
- **Contacts** (`/contact`) — People and relationship management

### Extension Guidelines
- **Natural Language First** — Design for conversational interaction
- **Data Separation** — Keep personal data in `workplace-data/`
- **Privacy Aware** — Never commit personal data to framework repo
- **Documentation Driven** — Specify formats and patterns clearly
- **Interoperable** — Modules should work together when possible

## Session Context

When Claude starts in this directory:

1. **Read Context**: This instructions.md provides system understanding
2. **Module Access**: Refer to `modules/<name>/README.md` for specifics
3. **Data Location**: All personal operations in `workplace-data/`
4. **Commands Available**: Global commands work from anywhere
5. **Extension Patterns**: Follow documented patterns for new features

## Git Architecture

### Dual Repository System
1. **Framework Repository** (this directory):
   - **Scope**: Commands, modules, documentation, scripts
   - **Sharing**: Public or team-shared
   - **Updates**: Pull to get new features and improvements

2. **Data Repository** (`workplace-data/`):
   - **Scope**: Personal tasks, notes, and information
   - **Sharing**: Private individual repositories  
   - **Updates**: Independent personal data management

3. **Isolation**: `workplace-data/` gitignored from framework repo

### Multi-User Benefits
- **Teams**: Share framework improvements, keep data private
- **Individuals**: Customize data structure, sync framework updates  
- **Organizations**: Standardize tooling, respect privacy
- **Open Source**: Framework improvements benefit everyone

## Development Workflow

### Framework Contributions
1. **Fork/Clone**: Framework repository
2. **Develop**: New commands, modules, improvements
3. **Test**: With sample data (not real personal data)
4. **Submit**: Pull request with documentation
5. **Document**: Update instructions and README

### Personal Customization
1. **Commands**: Add custom commands to `commands/`
2. **Modules**: Define personal module specifications
3. **Data**: Structure personal data in `workplace-data/`
4. **Skills**: Create specialized Claude behaviors
5. **Sync**: Use sync script for dual-repo management

---

This framework grows with your needs while keeping your data private and your tools shareable.