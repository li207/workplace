# Visual Module - Real-time Workspace Dashboard

A native visualization system for monitoring workspace activity and task progress in real-time.

## Overview

The Visual module provides a web-based dashboard that monitors workspace files and displays live updates of tasks, progress, and activity. It integrates seamlessly with the workspace framework through the `/visual` command system.

## Features

### 🔍 Real-time Monitoring
- **File Watcher**: Monitors todo and workspace markdown files
- **Live Updates**: WebSocket-based real-time dashboard updates
- **Activity Feed**: Shows file changes and workspace activity

### 📊 Dashboard Components
- **Active Tasks**: Priority-sorted task list with due dates
- **Workspace Status**: Progress tracking with visual indicators  
- **Activity Timeline**: Recent file changes and updates
- **Overview Metrics**: Task distribution and progress analytics

### 🎯 Key Benefits
- **Instant Awareness**: See workspace status at a glance
- **Progress Tracking**: Visual progress bars and completion metrics
- **Activity Monitoring**: Track what's happening across workspaces
- **Non-intrusive**: Runs in background, updates automatically

## Usage

### Basic Commands
```bash
# Start visualization dashboard
/visual start

# Quick status and open browser
/visual 

# Stop the dashboard server
/visual stop

# Show server status
/visual status
```

### Advanced Usage
```bash
# Start on custom port
/visual start --port 3001

# Start in background mode
/visual start --background

# Open dashboard in browser
/visual open
```

## Dashboard Layout

The dashboard displays a 2x2 grid with:

1. **Active Tasks** - Current tasks with priorities and due dates
2. **Workspaces** - Workspace status and progress indicators
3. **Activity Feed** - Real-time file change notifications
4. **Overview** - Summary metrics and analytics

## Technical Architecture

### File Monitoring
- **Patterns**: `todo/*.md`, `workspace/*/PROGRESS.md`, `workspace/*/README.md`
- **Events**: File add, change, delete
- **Processing**: Parse markdown to extract structured data

### Server Components
- **File Watcher**: `chokidar` for efficient file monitoring
- **Web Server**: Express.js serving dashboard assets
- **WebSocket**: Real-time updates to connected clients
- **Data Parser**: Markdown parsing for tasks and progress

### Frontend
- **Vanilla JavaScript**: No framework dependencies
- **WebSocket Client**: Real-time data synchronization
- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Clean, accessible interface

## Configuration

The visual module automatically detects workspace configuration from `~/.claude/workspace-path.txt`:

```
WORKSPACE_DIR=/path/to/workspace
WORKSPACE_DATA_DIR=/path/to/workspace-data
```

## Data Sources

### TODO Files
- `workspace-data/todo/active.md` - Active task list
- `workspace-data/todo/archive/*.md` - Completed tasks

### Workspace Files
- `workspace-data/workspace/*/PROGRESS.md` - Progress tracking
- `workspace-data/workspace/*/README.md` - Workspace metadata
- `workspace-data/workspace/*/docs/**` - Documentation changes
- `workspace-data/workspace/*/logs/**` - Investigation logs

## API Endpoints

When running, the server exposes:
- `GET /` - Dashboard web interface
- `GET /api/tasks` - Current tasks as JSON
- `GET /api/workspaces` - Workspace status as JSON  
- `GET /api/status` - Server status and metrics
- `WS /` - WebSocket for real-time updates

## Installation

The visual module is automatically available after running workspace bootstrap:

```bash
./bootstrap.sh
```

Dependencies are installed on first use of `/visual` command.

## Future Enhancements

### Phase 2 Features
- **Team Integration**: Share status with team platforms
- **Advanced Analytics**: Progress trends and insights
- **Custom Dashboards**: Configurable layout and metrics
- **Mobile App**: Native mobile dashboard
- **Notifications**: Desktop notifications for milestones

### Integration Ideas
- **IDE Plugins**: Show status in code editors
- **CLI Integration**: Terminal status display
- **Export Options**: Generate reports and summaries
- **API Extensions**: Third-party tool integration