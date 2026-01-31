# Extending Workplace

A comprehensive guide for adding new functionality to the Workplace framework.

## Overview

Workplace is designed for extensibility through three main mechanisms:
1. **Global Commands** — Natural language processors available everywhere
2. **Modules** — Feature specifications with data structures
3. **Skills** — Specialized Claude behaviors for complex tasks

## Extension Architecture

### Layer Structure
```
┌─────────────────────────────────────────────────────┐
│ Global Commands (/command-name)                     │
│ ├─ Natural language processing                      │
│ ├─ Installed to ~/.claude/commands/                 │
│ └─ Available from any directory                     │
├─────────────────────────────────────────────────────┤
│ Modules (Feature Specifications)                    │
│ ├─ Documentation in modules/module-name/            │
│ ├─ Data storage in workplace-data/module-name/      │
│ └─ Integration patterns and formats                 │
├─────────────────────────────────────────────────────┤
│ Skills (Specialized Behaviors)                      │
│ ├─ Context-specific Claude capabilities             │
│ ├─ Domain expertise and workflows                   │
│ └─ Enhanced processing for complex tasks            │
└─────────────────────────────────────────────────────┘
```

## Adding Global Commands

### 1. Create Command File
**Location**: `commands/command-name.md`

**Template**:
```markdown
---
title: Command Name
description: Natural language command for [purpose]
user-invocable: true
args:
  - name: command
    description: Natural language input (e.g., "create note about project status")
    type: string
    required: true
---

You are processing a natural language command for [module/feature].

## User Command: {{command}}

## Your Task:

1. **Load Configuration**: 
   - Read workplace paths from `~/.claude/workplace-path.txt`
   - Use `WORKPLACE_DATA_DIR/module-name/` for data operations

2. **Parse Natural Language**:
   - Identify intent: create, list, update, delete, etc.
   - Extract parameters: titles, dates, priorities, context
   - Handle ambiguity by asking for clarification

3. **Execute Operations**:
   - [Define specific operations for this command]
   - Follow data format conventions
   - Provide clear feedback

4. **Data Format**:
   ```markdown
   [Define the markdown structure this command uses]
   ```

5. **Error Handling**:
   - Ask for clarification when ambiguous
   - Show available options when references are unclear
   - Guide users toward successful completion

## Help Documentation:
[Include comprehensive help that shows natural language patterns]
```

### 2. Install Command
Commands are automatically installed by the bootstrap script to `~/.claude/commands/`

### 3. Usage Pattern
```bash
/command-name natural language description of what you want to do
```

## Adding Modules

### 1. Create Module Documentation
**Location**: `modules/module-name/README.md`

**Template**:
```markdown
# Module Name

Brief description of module purpose and capabilities.

## Overview
- What this module does
- Primary use cases  
- How it integrates with other modules

## Data Format

### Primary Entity
```markdown
- [ ] Entity title #id:abc123
  - field1: value
  - field2: value
  - created: YYYY-MM-DD
  - context: Additional details and links
```

## Operations

### Natural Language Patterns
- Creation: "create X", "add X", "new X"
- Listing: "show X", "list X", "see my X"
- Updates: "change X", "update X", "modify X"
- Deletion: "delete X", "remove X", "archive X"

### Command Examples
```bash
/module-command create new item with specific details
/module-command show all items from last week  
/module-command update first item with new information
```

## File Organization
- `workplace-data/module-name/active.md` — Current items
- `workplace-data/module-name/archive/` — Completed/old items
- `workplace-data/module-name/[other-files].md` — Additional data

## Integration Points
- How this module can work with other modules
- Shared data formats or references
- Cross-module workflows
```

### 2. Create Data Structure
**Location**: `workplace-data/module-name/`

Create the necessary directories and initial files:
```bash
mkdir -p workplace-data/module-name/archive
touch workplace-data/module-name/active.md
# Add other initial files as needed
```

### 3. Optional: Create Global Command
Follow the "Adding Global Commands" section to create `/module-command`

## Adding Skills

### 1. Create Skill File
**Location**: `.skills/skill-name/SKILL.md`

**Template**:
```markdown
# [Skill Name] Skill

Specialized Claude behavior for [specific domain or complex task].

## Purpose
This skill provides enhanced capabilities for:
- [Specific expertise area]
- [Complex workflow automation]  
- [Domain-specific knowledge application]

## Activation Context
This skill should be activated when:
- [Specific triggers or contexts]
- [User asks for advanced help in this domain]
- [Complex multi-step processes are needed]

## Specialized Knowledge
[Include domain expertise, best practices, common patterns]

## Enhanced Behaviors
When this skill is active, Claude should:
1. [Specific enhanced behavior 1]
2. [Specific enhanced behavior 2]
3. [Advanced processing patterns]

## Example Interactions
[Show how this skill enhances normal Claude responses]

## Integration
How this skill works with:
- Related modules
- Global commands  
- Other skills
```

### 2. Reference in Instructions
Add skill reference to `instructions.md` in the relevant module or context section.

## Extension Examples

### Example: Notes Module

#### 1. Global Command (`commands/note.md`)
```markdown
---
title: Note Management
description: Natural language note-taking and knowledge management
user-invocable: true
args:
  - name: command
    description: Natural language command for notes
    type: string
    required: true
---

Natural language processor for note management...
```

#### 2. Module Documentation (`modules/note/README.md`)
```markdown
# Note Module

Knowledge management with linking and organization.

## Data Format
```markdown
# Note Title #id:abc123
- created: 2026-01-31
- tags: [research, project-x]
- links: [[Other Note]], [[Project Status]]
- context: Meeting notes, research findings, quick thoughts

## Content
[Note content in markdown]
```

#### 3. Usage Examples
```bash
/note create project status update, link to [[Sprint Planning]]
/note show all notes about authentication from last month
/note update the security notes with new findings
```

### Example: Calendar Module

#### Command Patterns
```bash
/cal add meeting with client tomorrow 2pm, include budget discussion
/cal show what's scheduled for this week
/cal move the security review to next friday
/cal cancel the standup meeting tomorrow
```

#### Data Structure
```markdown
- [ ] Meeting with client #id:abc123
  - type: meeting
  - start: 2026-02-01 14:00
  - duration: 60
  - attendees: [client, pm, dev-lead]
  - context: Discuss Q2 budget and feature priorities
```

## Best Practices

### Natural Language Design
1. **Conversational Intent**: Design for how people naturally express tasks
2. **Flexible Parsing**: Accept multiple ways to say the same thing
3. **Clear Feedback**: Show what was understood and ask for clarification
4. **Context Aware**: Remember previous interactions and task state

### Data Organization
1. **Human Readable**: Use clean markdown that's easy to read and edit
2. **Structured Metadata**: Consistent field names and formats
3. **Context Rich**: Capture details that matter for decision making
4. **Archive Strategy**: Clear archiving patterns for completed items

### Integration Patterns
1. **Cross References**: Use consistent ID patterns for linking
2. **Shared Vocabularies**: Common tags and categories across modules
3. **Workflow Support**: Commands that work well together
4. **Data Portability**: Formats that can be used outside the system

### Privacy & Security
1. **Data Separation**: Always keep personal data in `workplace-data/`
2. **No Secrets**: Never commit sensitive information to framework repo
3. **Local Control**: User controls their own data repository
4. **Gitignore Compliance**: Ensure private data stays private

## Testing Extensions

### Development Workflow
1. **Create in Framework**: Add command/module to framework repo
2. **Test with Sample Data**: Use fake data, not real personal information
3. **Document Thoroughly**: Include examples and integration notes
4. **Bootstrap Test**: Ensure bootstrap installs correctly
5. **Multi-User Test**: Verify isolation and privacy

### Quality Checklist
- [ ] Natural language parsing handles ambiguity gracefully
- [ ] Data formats are consistent with existing patterns
- [ ] Help documentation is comprehensive and clear
- [ ] Privacy boundaries are respected
- [ ] Bootstrap integration works correctly
- [ ] Cross-platform compatibility maintained

---

The Workplace framework grows stronger with each thoughtful extension that maintains the core principles of natural language interaction, privacy, and human-readable data.