---
title: TODO Management
description: Manage tasks using the Workplace TODO module from anywhere
user-invocable: true
args:
  - name: operation
    description: Operation to perform (add, list, done, move, review)
    type: string
    required: true
  - name: task
    description: Task description, ID, or additional parameters
    type: string
    required: false
  - name: options
    description: Additional options like --priority, --due, --tags
    type: string
    required: false
---

You are managing tasks using the Workplace TODO system. This command works with any Workplace instance by finding the nearest workspace directory.

## Operation: {{operation}}
{{#if task}}## Task/Parameters: {{task}}{{/if}}
{{#if options}}## Options: {{options}}{{/if}}

## Your Task:

1. **Load Workplace Configuration**: 
   - Read workplace paths from `~/.claude/workplace-path.txt` which contains:
     - `WORKPLACE_DIR=<framework-path>`
     - `WORKPLACE_DATA_DIR=<data-path>`
   - If config file doesn't exist, inform user to run bootstrap script first
   - Use the `WORKPLACE_DATA_DIR` for all TODO operations

2. **Execute TODO Operation**: Based on the operation requested:

   - **add**: Create new task with format `- [ ] <description> #id:<6-char-id>` with metadata
     - Parse options for priority (high/medium/low), due date (YYYY-MM-DD), tags
     - Add to appropriate file in `workplace-data/todo/` (today.md if due today, upcoming.md if future date, inbox.md otherwise)
     - Generate unique 6-character alphanumeric ID
   
   - **list**: Display all active tasks from inbox.md, today.md, and upcoming.md (completed tasks are in archive)
     - If parameter specified (inbox/today/upcoming), show only that file
     - If no parameter or "all", show all active tasks from all files
     - Format: `- [ ] [PRIORITY] Task description (due: date) #id:abc123 [FILE]`
     - Group by file and show overdue tasks with warning markers
     - Do NOT include archived/completed tasks
   
   - **done**: Mark task complete and archive
     - Find task by ID or description match
     - Change `[ ]` to `[x]`, add `completed: YYYY-MM-DD` field
     - Move to `workplace-data/todo/archive/YYYY-MM-DD.md` based on completion date
   
   - **move**: Move task between files
     - Find task and move to target file (inbox.md, today.md, upcoming.md)
   
   - **review**: Show overdue tasks + today's tasks + upcoming summary

3. **Data Format**: Use the Workplace TODO format:
   ```markdown
   - [ ] Task description #id:abc123
     - priority: medium
     - due: 2026-02-01
     - created: 2026-01-31
     - tags: [work, urgent]
   ```

4. **Error Handling**: 
   - If no workplace found: Inform user and suggest initializing one
   - If task not found: Show available tasks to help user identify the right one
   - If invalid date format: Show correct format (YYYY-MM-DD)

## Response Format:
- Be concise and action-oriented
- Show the result of the operation clearly
- For list operations, use clean markdown formatting
- Include helpful context like task counts or next steps