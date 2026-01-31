# Workplace

A modular, file-based personal workspace system designed to work with Claude AI.

## What is this?

Workplace is a lightweight framework for managing personal tasks, notes, and other data using simple markdown files. It's designed to:

- Work seamlessly with Claude Code (CLI) and Claude Cowork (desktop)
- Store everything in human-readable markdown
- Keep your data private and portable
- Be extendable with new modules

## Quick Start

1. Clone this repo
2. Run the bootstrap script:
   ```bash
   ./bootstrap.sh
   ```
3. Use the global `/todo` command from anywhere:
   ```bash
   /todo review
   /todo add "Test the system" --priority high
   ```

## Structure

```
workplace/
├── instructions.md    # Context for Claude sessions
├── CLAUDE.md          # Claude Code shortcuts
├── modules/           # Module definitions
├── scripts/           # Automation tools
└── workplace-data/    # Your private data (separate repo)
```

## Available Modules

- **TODO** — Task management with priorities, due dates, and archiving

## Adding Your Data

The `workplace-data/` folder is gitignored and managed as a separate repository. The bootstrap script will set this up automatically, or you can clone an existing workplace-data repo:

```bash
# During bootstrap, you can provide your workplace-data repo URL
# Or manually clone later:
git clone <your-workplace-data-repo> workplace-data
```

## Syncing

Use the sync script to push both repos:

```bash
./scripts/sync.sh
```

## License

MIT — use it, modify it, share it.
