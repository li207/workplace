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

    this.activePath = path.join(this.workspaceDataDir, 'active');
    this.archivePath = path.join(this.workspaceDataDir, 'archive');
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
          activePath: this.activePath,
          archivePath: this.archivePath
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
        res.status(404).json({ error: 'Task not found or no PROGRESS.md' });
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
      path.join(this.activePath, '*/task.md'),
      path.join(this.activePath, '*/PROGRESS.md'),
      path.join(this.activePath, '*/CLAUDE.md'),
      path.join(this.activePath, '*/docs/**/*.md'),
      path.join(this.activePath, '*/logs/**/*.md')
    ];

    console.log('👀 Monitoring paths:', watchPaths);

    this.watcher = chokidar.watch(watchPaths, {
      ignored: [
        /[\/\\]\./,
        '**/.DS_Store',
        '**/node_modules/**',
        '**/*.tmp',
        '**/*.swp'
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

    try {
      if (filePath.endsWith('task.md')) {
        if (eventType === 'delete' || eventType === 'unlink') {
          const taskId = path.basename(path.dirname(filePath));
          this.tasks.delete(taskId);
          console.log(`🗑️ Removed task ${taskId} from tracking`);
        } else {
          this.updateTaskFromFile(filePath);
        }
      } else if (filePath.endsWith('PROGRESS.md')) {
        if (eventType === 'delete' || eventType === 'unlink') {
          const taskId = path.basename(path.dirname(filePath));
          if (this.workspaces.has(taskId)) {
            this.workspaces.delete(taskId);
            console.log(`🗑️ Removed workspace ${taskId} from tracking`);
          }
        } else {
          this.updateWorkspaceProgress(filePath);
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

  updateTaskFromFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    const taskId = path.basename(path.dirname(filePath));
    const task = this.parseTaskFile(content, taskId);

    if (task) {
      // Read state from PROGRESS.md
      const progressPath = path.join(path.dirname(filePath), 'PROGRESS.md');
      if (fs.existsSync(progressPath)) {
        const progressContent = fs.readFileSync(progressPath, 'utf8');
        const progress = this.parseProgressFile(progressContent);
        task.taskStatus = progress.status || 'Not Started';
      } else {
        task.taskStatus = 'Not Started';
      }
      this.tasks.set(taskId, task);
      console.log(`📝 Updated task ${taskId}: ${task.title}`);
    }
  }

  parseTaskFile(content, taskId) {
    const titleMatch = content.match(/^# (.+)$/m);
    const idMatch = content.match(/\*\*id\*\*:\s*(\w+)/);
    const priorityMatch = content.match(/\*\*priority\*\*:\s*(\w+)/);
    const createdMatch = content.match(/\*\*created\*\*:\s*([\d-]+)/);
    const dueMatch = content.match(/\*\*due\*\*:\s*([\d-]+)/);
    const tagsMatch = content.match(/\*\*tags\*\*:\s*\[([^\]]*)\]/);
    const completedMatch = content.match(/\*\*completed\*\*:\s*([\d-]+)/);
    const contextMatch = content.match(/## Context\s*\n([\s\S]*?)(?=\n## |$)/);

    return {
      title: titleMatch?.[1]?.trim() || 'Untitled',
      id: idMatch?.[1] || taskId,
      priority: priorityMatch?.[1] || 'p2',
      created: createdMatch?.[1] || null,
      due: dueMatch?.[1] || null,
      tags: tagsMatch?.[1] ? tagsMatch[1].split(',').map(t => t.trim()).filter(Boolean) : [],
      completed: completedMatch?.[1] || null,
      context: contextMatch?.[1]?.trim() || ''
    };
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

  parseProgressFile(content) {
    const stateMatch = content.match(/\*\*State\*\*:\s*([^\n]+)/);
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
      status: stateMatch?.[1]?.trim() || 'In Progress',
      currentFocus: focusMatch?.[1]?.trim() || '',
      completedPhases: completedCheckboxes,
      totalPhases: totalCheckboxes,
      progress
    };
  }

  getRecentArchivedTasks() {
    if (!fs.existsSync(this.archivePath)) {
      return [];
    }

    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const archivedTasks = [];

    // Scan archive/{id}/task.md directories
    const archiveDirs = fs.readdirSync(this.archivePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name !== 'weeks' && !dirent.name.startsWith('.'));

    for (const dir of archiveDirs) {
      const taskFilePath = path.join(this.archivePath, dir.name, 'task.md');
      if (!fs.existsSync(taskFilePath)) continue;

      const content = fs.readFileSync(taskFilePath, 'utf8');
      const task = this.parseTaskFile(content, dir.name);

      if (task.completed) {
        const completedDate = new Date(task.completed);
        if (completedDate >= threeDaysAgo && completedDate <= today) {
          task.taskStatus = 'Finished';
          archivedTasks.push(task);
        }
      }
    }

    // Sort by completed date descending
    archivedTasks.sort((a, b) => new Date(b.completed) - new Date(a.completed));

    return archivedTasks.length >= 10 ? archivedTasks : archivedTasks.slice(0, 10);
  }

  getWorkspaceProgress(taskId) {
    // Check active task first
    let progressPath = path.join(this.activePath, taskId, 'PROGRESS.md');

    // If not found, check archived task
    if (!fs.existsSync(progressPath)) {
      progressPath = path.join(this.archivePath, taskId, 'PROGRESS.md');
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

  loadInitialData() {
    console.log('📂 Loading initial data...');

    // Load tasks from active/{id}/task.md
    if (fs.existsSync(this.activePath)) {
      const taskDirs = fs.readdirSync(this.activePath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .map(dirent => dirent.name);

      taskDirs.forEach(taskId => {
        const taskFile = path.join(this.activePath, taskId, 'task.md');
        const progressFile = path.join(this.activePath, taskId, 'PROGRESS.md');

        if (fs.existsSync(taskFile)) {
          this.updateTaskFromFile(taskFile);
        }
        if (fs.existsSync(progressFile)) {
          this.updateWorkspaceProgress(progressFile);
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
