---
title: Visual Dashboard
description: Real-time workspace visualization and monitoring
user-invocable: true
args:
  - name: command
    description: Visual command (start, stop, status, open)
    type: string
    required: false
---

You are managing workspace visualization using the Visual module with natural language processing.

## User Command: {{command}}

## Your Task:

1. **Load Workspace Configuration**: 
   - Read workspace paths from `~/.claude/workspace-path.txt` which contains:
     - `WORKSPACE_DIR=<framework-path>`
     - `WORKSPACE_DATA_DIR=<data-path>`
   - If config file doesn't exist, inform user to run bootstrap script first

2. **Parse Natural Language Command**: 
   - Analyze the user's command to determine intent
   - Common intent patterns:
     - **Start**: "start", "begin", "launch", "run" → Start visualization server
     - **Stop**: "stop", "end", "kill", "shutdown" → Stop visualization server
     - **Status**: "status", "check", "info" → Show server status
     - **Open**: "open", "view", "show", "browser" → Open dashboard in browser
     - **Default**: No args or "visual" → Quick start + open browser

3. **Execute Operation**:

   - **START**: Launch visualization dashboard server
     ```bash
     cd WORKSPACE_DIR/modules/visual
     npm install  # If not already installed
     node server.js --port 3000 --background
     ```
     - Check if server is already running on port 3000
     - Install dependencies if needed
     - Start server in background
     - Show access URL and instructions

   - **STOP**: Stop the visualization server
     ```bash
     # Find and kill the visualization server process
     pkill -f "node.*visual.*server.js"
     ```
     - Find running server process
     - Gracefully stop the server
     - Confirm shutdown

   - **STATUS**: Show server status
     - Check if server is running (port 3000 check)
     - Show process info if running
     - Display access URL if available
     - Show recent activity/connections

   - **OPEN**: Open dashboard in browser
     ```bash
     # macOS
     open http://localhost:3000
     
     # Linux
     xdg-open http://localhost:3000
     
     # Windows
     start http://localhost:3000
     ```
     - Check if server is running first
     - Open browser to dashboard URL
     - Show instructions if server not running

   - **DEFAULT** (no args): Quick start
     - Start server if not running
     - Open browser automatically  
     - Show dashboard URL and instructions

4. **Server Management**:

   - **Dependencies**: Auto-install on first run
     ```bash
     cd WORKSPACE_DIR/modules/visual
     if [ ! -d "node_modules" ]; then
       npm install
     fi
     ```

   - **Port Management**: Check for conflicts
     ```bash
     # Check if port 3000 is in use
     lsof -ti :3000
     ```

   - **Process Tracking**: Remember running servers
     ```bash
     # Store PID for management
     echo $! > ~/.claude/visual-server.pid
     ```

5. **Error Handling**:
   - **No workspace config**: Guide user to run bootstrap
   - **Port in use**: Suggest different port or stop conflicting process  
   - **Dependencies missing**: Auto-install with progress indicator
   - **Server start failure**: Show error details and troubleshooting
   - **Browser open failure**: Show manual URL

6. **Output Format**:
   
   **Starting Server:**
   ```
   🚀 Starting Workspace Visualization...
   
   📦 Installing dependencies... ✅
   🌐 Server starting on http://localhost:3000... ✅  
   🔍 Monitoring workspace files... ✅
   
   🎯 Dashboard ready! 
   📱 Open: http://localhost:3000
   🛑 Stop: /visual stop
   ```

   **Server Status:**
   ```
   📊 Visualization Server Status
   
   🟢 Running on http://localhost:3000
   📈 Monitoring 5 workspaces, 3 active tasks  
   🔌 2 clients connected
   ⏱️  Uptime: 2h 15m
   
   📱 Open Dashboard: http://localhost:3000
   ```

   **Quick Start:**
   ```
   🎯 Workspace Dashboard Starting...
   
   🌐 Server: http://localhost:3000 ✅
   🚀 Opening in browser... ✅
   
   Your workspace is now being monitored in real-time!
   ```

## Special Commands:

### Advanced Options
```bash
/visual start --port 3001        # Custom port
/visual start --background       # Background mode only  
/visual start --no-browser       # Don't auto-open browser
```

### Troubleshooting  
```bash
/visual restart                   # Stop and start
/visual logs                      # Show server logs
/visual reset                     # Reset and reinstall
```

## Integration Notes:

- **Auto-start**: Can be configured to start with workspace sessions
- **Background**: Runs quietly, updates dashboard in real-time
- **Multi-session**: Supports multiple workspace sessions simultaneously  
- **Performance**: Lightweight, minimal resource usage

ARGUMENTS: {{command}}