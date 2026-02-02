const express = require('express');
const chokidar = require('chokidar');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const os = require('os');

class WorkspaceVisualizer {
  constructor(options = {}) {
    this.app = express();
    this.port = options.port || 3000;
    this.wsPort = options.wsPort || 8080;
    
    // WebSocket server for real-time updates
    this.wss = new WebSocket.Server({ port: this.wsPort });
    
    // In-memory state
    this.tasks = new Map();
    this.workspaces = new Map();
    this.clients = new Set();
    this.startTime = Date.now();
    
    // Load workspace configuration
    this.loadWorkspaceConfig();
    
    console.log('🔧 Workspace Visualizer initialized');
    console.log('📁 Workspace Data:', this.workspaceDataDir);
  }
  
  loadWorkspaceConfig() {
    const configPath = path.join(os.homedir(), '.claude', 'workspace-path.txt');
    
    if (!fs.existsSync(configPath)) {
      console.error('❌ Workspace configuration not found');
      console.error('💡 Please run bootstrap script first');
      process.exit(1);
    }
    
    const config = fs.readFileSync(configPath, 'utf8');
    const lines = config.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key === 'WORKSPACE_DATA_DIR') {
        this.workspaceDataDir = value;
      } else if (key === 'WORKSPACE_DIR') {
        this.workspaceDir = value;
      }
    });
    
    if (!this.workspaceDataDir) {
      console.error('❌ WORKSPACE_DATA_DIR not found in config');
      process.exit(1);
    }
    
    this.todoPath = path.join(this.workspaceDataDir, 'todo');
    this.workspacesPath = path.join(this.workspaceDataDir, 'workspace');
  }
  
  async init() {
    console.log('🚀 Starting Workspace Visualization Server...');
    
    this.setupWebServer();
    this.setupFileWatcher();
    this.loadInitialData();
    this.setupWebSocket();
    
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`🌐 Dashboard server running at http://localhost:${this.port}`);
        console.log(`🔌 WebSocket server running on port ${this.wsPort}`);
        resolve();
      });
    });
  }
  
  setupWebServer() {
    // Security headers
    this.app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    });
    
    // Serve static files
    this.app.use(express.static(path.join(__dirname, 'public')));
    
    // API endpoints
    this.app.get('/api/tasks', (req, res) => {
      res.json({
        tasks: Array.from(this.tasks.values()),
        count: this.tasks.size,
        lastUpdated: new Date().toISOString()
      });
    });
    
    this.app.get('/api/workspaces', (req, res) => {
      res.json({
        workspaces: Array.from(this.workspaces.values()),
        count: this.workspaces.size,
        lastUpdated: new Date().toISOString()
      });
    });
    
    this.app.get('/api/status', (req, res) => {
      res.json({
        status: 'running',
        uptime: Date.now() - this.startTime,
        tasks: this.tasks.size,
        workspaces: this.workspaces.size,
        clients: this.clients.size,
        monitoring: {
          todoPath: this.todoPath,
          workspacesPath: this.workspacesPath
        }
      });
    });
    
    // Archived tasks endpoint
    this.app.get('/api/archived-tasks', (req, res) => {
      const archivedTasks = this.getRecentArchivedTasks();
      res.json({
        tasks: archivedTasks,
        count: archivedTasks.length,
        lastUpdated: new Date().toISOString()
      });
    });

    // Workspace progress endpoint
    this.app.get('/api/workspace/:taskId/progress', (req, res) => {
      const { taskId } = req.params;
      const progress = this.getWorkspaceProgress(taskId);

      if (!progress) {
        res.status(404).json({ error: 'Workspace not found or no PROGRESS.md' });
        return;
      }

      res.json({
        taskId,
        ...progress,
        lastUpdated: new Date().toISOString()
      });
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
  }
  
  setupFileWatcher() {
    const watchPaths = [
      path.join(this.todoPath, '*.md'),
      path.join(this.workspacesPath, '*/PROGRESS.md'),
      path.join(this.workspacesPath, '*/README.md'),
      path.join(this.workspacesPath, '*/docs/**/*.md'),
      path.join(this.workspacesPath, '*/logs/**/*.md')
    ];
    
    console.log('👀 Monitoring paths:', watchPaths);
    
    this.watcher = chokidar.watch(watchPaths, {
      ignored: [
        /[\/\\]\./,
        '**/.DS_Store',
        '**/node_modules/**',
        '**/*.tmp',
        '**/*.swp',
        '**/archive/**'
      ],
      persistent: true,
      ignoreInitial: false,
      depth: 10
    });
    
    this.watcher
      .on('add', (filePath) => this.handleFileChange(filePath, 'add'))
      .on('change', (filePath) => this.handleFileChange(filePath, 'change'))
      .on('unlink', (filePath) => this.handleFileChange(filePath, 'delete'))
      .on('error', (error) => console.error('🔥 Watcher error:', error))
      .on('ready', () => console.log('✅ File watching ready'));
  }
  
  handleFileChange(filePath, eventType) {
    console.log(`📁 File ${eventType}: ${path.relative(this.workspaceDataDir, filePath)}`);

    // Ignore archived workspaces
    if (filePath.includes('/archive/')) {
      console.log(`📦 Ignoring archived file: ${path.basename(filePath)}`);
      return;
    }

    try {
      if (filePath.includes('todo/active.md')) {
        this.updateTasks(filePath);
      } else if (filePath.includes('PROGRESS.md')) {
        if (eventType === 'delete' || eventType === 'unlink') {
          // Remove workspace from Map when its PROGRESS.md is deleted
          const workspaceId = path.basename(path.dirname(filePath));
          if (this.workspaces.has(workspaceId)) {
            this.workspaces.delete(workspaceId);
            console.log(`🗑️ Removed workspace ${workspaceId} from tracking`);
          }
        } else {
          this.updateWorkspaceProgress(filePath);
        }
      } else if (filePath.includes('README.md') && filePath.includes('/workspace/')) {
        if (eventType === 'delete' || eventType === 'unlink') {
          const workspaceId = path.basename(path.dirname(filePath));
          if (this.workspaces.has(workspaceId)) {
            this.workspaces.delete(workspaceId);
            console.log(`🗑️ Removed workspace ${workspaceId} from tracking`);
          }
        } else {
          this.updateWorkspaceInfo(filePath);
        }
      }
      
      // Broadcast update to all connected clients
      this.broadcast({
        type: 'file_update',
        file: path.relative(this.workspaceDataDir, filePath),
        event: eventType,
        timestamp: new Date().toISOString(),
        data: {
          tasks: Array.from(this.tasks.values()),
          workspaces: Array.from(this.workspaces.values()),
          archivedTasks: this.getRecentArchivedTasks()
        }
      });
    } catch (error) {
      console.error('🔥 Error handling file change:', error);
    }
  }
  
  updateTasks(filePath) {
    if (!fs.existsSync(filePath)) {
      this.tasks.clear();
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const tasks = this.parseTodoFile(content);
    
    this.tasks.clear();
    tasks.forEach(task => {
      this.tasks.set(task.id, task);
    });
    
    console.log(`📝 Updated ${tasks.length} tasks`);
  }
  
  updateWorkspaceProgress(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const workspaceId = path.basename(path.dirname(filePath));
    const progress = this.parseProgressFile(content);
    
    const existing = this.workspaces.get(workspaceId) || {};
    this.workspaces.set(workspaceId, {
      ...existing,
      id: workspaceId,
      ...progress,
      lastUpdated: new Date().toISOString()
    });
    
    console.log(`🔄 Updated workspace ${workspaceId}: ${progress.status} (${progress.progress}%)`);
  }
  
  updateWorkspaceInfo(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const workspaceId = path.basename(path.dirname(filePath));
    const info = this.parseWorkspaceInfo(content);
    
    const existing = this.workspaces.get(workspaceId) || {};
    this.workspaces.set(workspaceId, {
      ...existing,
      id: workspaceId,
      ...info
    });
    
    console.log(`📋 Updated workspace ${workspaceId} info`);
  }
  
  parseTodoFile(content) {
    const tasks = [];
    const lines = content.split('\n');
    let currentTask = null;

    for (const line of lines) {
      const taskMatch = line.match(/^- \[ \] (.+) #id:(\w+)$/);
      if (taskMatch) {
        if (currentTask) {
          // Determine status based on workspace existence
          currentTask.taskStatus = this.getTaskStatus(currentTask.id);
          tasks.push(currentTask);
        }
        currentTask = {
          title: taskMatch[1],
          id: taskMatch[2],
          priority: 'p2',
          created: new Date().toISOString().split('T')[0],
          due: null,
          tags: [],
          context: ''
        };
      } else if (currentTask) {
        const priorityMatch = line.match(/^\s*- priority: (\w+)$/);
        const createdMatch = line.match(/^\s*- created: ([\d-]+)$/);
        const dueMatch = line.match(/^\s*- due: ([\d-]+)$/);
        const tagsMatch = line.match(/^\s*- tags: \[([^\]]*)\]$/);
        const contextMatch = line.match(/^\s*- context: (.+)$/);

        if (priorityMatch) currentTask.priority = priorityMatch[1];
        if (createdMatch) currentTask.created = createdMatch[1];
        if (dueMatch) currentTask.due = dueMatch[1];
        if (tagsMatch) currentTask.tags = tagsMatch[1].split(', ').filter(t => t);
        if (contextMatch) currentTask.context = contextMatch[1];
      }
    }

    if (currentTask) {
      currentTask.taskStatus = this.getTaskStatus(currentTask.id);
      tasks.push(currentTask);
    }
    return tasks;
  }

  getTaskStatus(taskId) {
    // Check if workspace exists for this task
    const workspacePath = path.join(this.workspacesPath, taskId);
    if (fs.existsSync(workspacePath)) {
      return 'Ongoing';
    }
    return 'Not Started';
  }

  parseArchivedTodoFile(content) {
    const tasks = [];
    const lines = content.split('\n');
    let currentTask = null;

    for (const line of lines) {
      const taskMatch = line.match(/^- \[x\] (.+) #id:(\w+)$/);
      if (taskMatch) {
        if (currentTask) tasks.push(currentTask);
        currentTask = {
          title: taskMatch[1],
          id: taskMatch[2],
          priority: 'p2',
          created: null,
          completed: null,
          tags: [],
          context: '',
          taskStatus: 'Finished'
        };
      } else if (currentTask) {
        const priorityMatch = line.match(/^\s*- priority: (\w+)$/);
        const createdMatch = line.match(/^\s*- created: ([\d-]+)$/);
        const completedMatch = line.match(/^\s*- completed: ([\d-]+)$/);
        const tagsMatch = line.match(/^\s*- tags: \[([^\]]*)\]$/);
        const contextMatch = line.match(/^\s*- context: (.+)$/);

        if (priorityMatch) currentTask.priority = priorityMatch[1];
        if (createdMatch) currentTask.created = createdMatch[1];
        if (completedMatch) currentTask.completed = completedMatch[1];
        if (tagsMatch) currentTask.tags = tagsMatch[1].split(', ').filter(t => t);
        if (contextMatch) currentTask.context = contextMatch[1];
      }
    }

    if (currentTask) tasks.push(currentTask);
    return tasks;
  }

  getRecentArchivedTasks() {
    const archivePath = path.join(this.todoPath, 'archive');
    if (!fs.existsSync(archivePath)) {
      return [];
    }

    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const archivedTasks = [];

    // Get archive files from last 3 days
    const files = fs.readdirSync(archivePath)
      .filter(f => f.endsWith('.md'))
      .map(f => ({
        name: f,
        date: f.replace('.md', '')
      }))
      .filter(f => {
        const fileDate = new Date(f.date);
        return fileDate >= threeDaysAgo && fileDate <= today;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    for (const file of files) {
      const filePath = path.join(archivePath, file.name);
      const content = fs.readFileSync(filePath, 'utf8');
      const tasks = this.parseArchivedTodoFile(content);

      // Add completed date from filename if not in task
      tasks.forEach(task => {
        if (!task.completed) {
          task.completed = file.date;
        }
      });

      archivedTasks.push(...tasks);
    }

    // Return max(all from 3 days, 10 tasks)
    return archivedTasks.length >= 10 ? archivedTasks : archivedTasks.slice(0, 10);
  }

  getWorkspaceProgress(taskId) {
    // Check active workspace first
    let progressPath = path.join(this.workspacesPath, taskId, 'PROGRESS.md');

    // If not found, check archived workspace
    if (!fs.existsSync(progressPath)) {
      progressPath = path.join(this.workspacesPath, 'archive', taskId, 'PROGRESS.md');
    }

    if (!fs.existsSync(progressPath)) {
      return null;
    }

    const rawContent = fs.readFileSync(progressPath, 'utf8');
    const parsed = this.parseProgressFile(rawContent);

    return {
      raw: rawContent,
      ...parsed
    };
  }
  
  parseProgressFile(content) {
    const statusMatch = content.match(/\*\*Status:\*\* ([^|]+)/);
    const titleMatch = content.match(/# Progress: (.+)/);
    const focusMatch = content.match(/## Current Focus\s*\n([^\n#]+)/);

    // Extract Next Actions section to count checkboxes
    const nextActionsMatch = content.match(/## Next Actions\s*\n([\s\S]*?)(?=\n## |$)/);
    const nextActionsContent = nextActionsMatch ? nextActionsMatch[1] : '';

    // Count completed vs total checkboxes in Next Actions only
    const completedCheckboxes = (nextActionsContent.match(/- \[x\]/gi) || []).length;
    const totalCheckboxes = (nextActionsContent.match(/- \[[x\s]\]/gi) || []).length;

    // Auto-calculate progress from Next Actions checkboxes
    let progress = 0;
    if (totalCheckboxes > 0) {
      progress = Math.round((completedCheckboxes / totalCheckboxes) * 100);
    }

    return {
      title: titleMatch?.[1]?.trim() || 'Unknown Task',
      status: statusMatch?.[1]?.trim() || 'In Progress',
      currentFocus: focusMatch?.[1]?.trim() || '',
      completedPhases: completedCheckboxes,
      totalPhases: totalCheckboxes,
      progress
    };
  }
  
  parseWorkspaceInfo(content) {
    const titleMatch = content.match(/# Workspace: (.+)/);
    const priorityMatch = content.match(/\*\*Priority:\*\* (\w+)/);
    const dueMatch = content.match(/\*\*Due:\*\* ([\d-]+)/);
    const taskIdMatch = content.match(/\*\*Task ID:\*\* (\w+)/);
    
    return {
      title: titleMatch?.[1]?.trim() || 'Unknown Workspace',
      priority: priorityMatch?.[1]?.toLowerCase() || 'p2',
      due: dueMatch?.[1] || null,
      taskId: taskIdMatch?.[1] || null
    };
  }
  
  loadInitialData() {
    console.log('📂 Loading initial data...');
    
    // Load initial todo data
    const todoFile = path.join(this.todoPath, 'active.md');
    if (fs.existsSync(todoFile)) {
      this.updateTasks(todoFile);
    }
    
    // Load initial workspace data (exclude archive directory)
    if (fs.existsSync(this.workspacesPath)) {
      const workspaceDirs = fs.readdirSync(this.workspacesPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.') && dirent.name !== 'archive')
        .map(dirent => dirent.name);
      
      workspaceDirs.forEach(workspaceId => {
        const progressFile = path.join(this.workspacesPath, workspaceId, 'PROGRESS.md');
        const readmeFile = path.join(this.workspacesPath, workspaceId, 'README.md');
        
        if (fs.existsSync(progressFile)) {
          this.updateWorkspaceProgress(progressFile);
        }
        if (fs.existsSync(readmeFile)) {
          this.updateWorkspaceInfo(readmeFile);
        }
      });
    }
    
    console.log(`✅ Loaded ${this.tasks.size} tasks and ${this.workspaces.size} workspaces`);
  }
  
  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      console.log(`👋 Client connected (${this.clients.size} total)`);
      
      // Send initial data
      ws.send(JSON.stringify({
        type: 'initial_data',
        tasks: Array.from(this.tasks.values()),
        workspaces: Array.from(this.workspaces.values()),
        archivedTasks: this.getRecentArchivedTasks(),
        timestamp: new Date().toISOString()
      }));
      
      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`👋 Client disconnected (${this.clients.size} remaining)`);
      });
      
      ws.on('error', (error) => {
        console.error('🔥 WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
    
    console.log(`🔌 WebSocket server ready on port ${this.wsPort}`);
  }
  
  broadcast(data) {
    const message = JSON.stringify(data);
    let sent = 0;
    
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
        sent++;
      } else {
        this.clients.delete(client);
      }
    });
    
    if (sent > 0) {
      console.log(`📡 Broadcasted to ${sent} clients`);
    }
  }
  
  async shutdown() {
    console.log('🛑 Shutting down visualization server...');
    
    if (this.watcher) {
      await this.watcher.close();
      console.log('✅ File watcher stopped');
    }
    
    if (this.wss) {
      this.wss.close();
      console.log('✅ WebSocket server stopped');
    }
    
    if (this.server) {
      this.server.close();
      console.log('✅ Web server stopped');
    }
  }
  
  getStatus() {
    return {
      running: true,
      uptime: Date.now() - this.startTime,
      url: `http://localhost:${this.port}`,
      tasks: this.tasks.size,
      workspaces: this.workspaces.size,
      clients: this.clients.size
    };
  }
}

// Handle process signals for graceful shutdown
let visualizer = null;

process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  if (visualizer) {
    await visualizer.shutdown();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  if (visualizer) {
    await visualizer.shutdown();
  }
  process.exit(0);
});

// Start server if run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  args.forEach((arg, index) => {
    if (arg === '--port' && args[index + 1]) {
      options.port = parseInt(args[index + 1]);
    }
    if (arg === '--background') {
      options.background = true;
    }
  });
  
  visualizer = new WorkspaceVisualizer(options);
  visualizer.init().catch(error => {
    console.error('🔥 Failed to start visualizer:', error);
    process.exit(1);
  });
}

module.exports = WorkspaceVisualizer;