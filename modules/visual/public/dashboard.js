class WorkspaceDashboard {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.tasks = new Map();
        this.workspaces = new Map();
        this.activityLog = [];
        
        this.init();
    }
    
    init() {
        this.setupWebSocket();
        this.setupEventListeners();
    }
    
    setupWebSocket() {
        try {
            this.ws = new WebSocket('ws://localhost:8080');
            
            this.ws.onopen = () => {
                console.log('🔌 Connected to workspace server');
                this.setConnectionStatus(true);
            };
            
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };
            
            this.ws.onclose = () => {
                console.log('❌ Disconnected from workspace server');
                this.setConnectionStatus(false);
                // Attempt to reconnect after 3 seconds
                setTimeout(() => this.setupWebSocket(), 3000);
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.setConnectionStatus(false);
            };
            
        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
            this.setConnectionStatus(false);
        }
    }
    
    handleMessage(data) {
        switch (data.type) {
            case 'initial_data':
                this.loadInitialData(data);
                break;
            case 'file_update':
                this.handleFileUpdate(data);
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    }
    
    loadInitialData(data) {
        // Load tasks
        this.tasks.clear();
        data.tasks.forEach(task => {
            this.tasks.set(task.id, task);
        });
        
        // Load workspaces
        this.workspaces.clear();
        data.workspaces.forEach(workspace => {
            this.workspaces.set(workspace.id, workspace);
        });
        
        this.render();
        console.log(`📊 Loaded ${this.tasks.size} tasks, ${this.workspaces.size} workspaces`);
    }
    
    handleFileUpdate(data) {
        // Add to activity log
        this.addActivity({
            type: data.event,
            file: this.getFileName(data.file),
            timestamp: data.timestamp
        });
        
        // Update data
        if (data.data) {
            if (data.data.tasks) {
                this.tasks.clear();
                data.data.tasks.forEach(task => {
                    this.tasks.set(task.id, task);
                });
            }
            
            if (data.data.workspaces) {
                this.workspaces.clear();
                data.data.workspaces.forEach(workspace => {
                    this.workspaces.set(workspace.id, workspace);
                });
            }
        }
        
        this.render();
        this.updateStatus();
    }
    
    addActivity(activity) {
        this.activityLog.unshift(activity);
        // Keep only last 20 activities
        if (this.activityLog.length > 20) {
            this.activityLog = this.activityLog.slice(0, 20);
        }
    }
    
    getFileName(filePath) {
        return filePath.split('/').pop();
    }
    
    render() {
        this.renderTasks();
        this.renderWorkspaces();
        this.renderActivity();
        this.renderOverview();
    }
    
    renderTasks() {
        const container = document.getElementById('tasks-container');
        const tasks = Array.from(this.tasks.values());
        
        if (tasks.length === 0) {
            container.innerHTML = '<div class="empty-state">No active tasks</div>';
            return;
        }
        
        // Sort by priority (p0 first) then by due date
        const priorityOrder = { p0: 0, p1: 1, p2: 2, p3: 3 };
        tasks.sort((a, b) => {
            if (a.priority !== b.priority) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            if (a.due !== b.due) {
                if (!a.due) return 1;
                if (!b.due) return -1;
                return new Date(a.due) - new Date(b.due);
            }
            return new Date(b.created) - new Date(a.created);
        });
        
        container.innerHTML = tasks.map(task => this.renderTask(task)).join('');
    }
    
    renderTask(task) {
        const isOverdue = task.due && new Date(task.due) < new Date();
        const dueText = task.due ? 
            (isOverdue ? `Overdue (${task.due})` : `Due: ${task.due}`) : 
            'No deadline';
        
        return `
            <div class="task-card priority-${task.priority}">
                <div class="task-header">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    <div class="task-priority ${task.priority}">${task.priority.toUpperCase()}</div>
                </div>
                <div class="task-meta">
                    ID: ${task.id} • Created: ${task.created}
                </div>
                <div class="task-due ${isOverdue ? 'overdue' : ''}">${dueText}</div>
                ${task.tags && task.tags.length ? 
                    `<div style="margin-top: 8px; font-size: 12px; color: #86868b;">
                        ${task.tags.map(tag => `<span style="background: #f2f2f7; padding: 2px 6px; border-radius: 4px; margin-right: 4px;">${this.escapeHtml(tag)}</span>`).join('')}
                    </div>` : ''
                }
                ${task.context ? 
                    `<div style="margin-top: 8px; font-size: 12px; color: #86868b; font-style: italic;">
                        ${this.escapeHtml(task.context)}
                    </div>` : ''
                }
            </div>
        `;
    }
    
    renderWorkspaces() {
        const container = document.getElementById('workspaces-container');
        const workspaces = Array.from(this.workspaces.values());
        
        if (workspaces.length === 0) {
            container.innerHTML = '<div class="empty-state">No active workspaces</div>';
            return;
        }
        
        // Sort by priority and progress
        const priorityOrder = { p0: 0, p1: 1, p2: 2, p3: 3 };
        workspaces.sort((a, b) => {
            const aPriority = priorityOrder[a.priority] || 2;
            const bPriority = priorityOrder[b.priority] || 2;
            if (aPriority !== bPriority) {
                return aPriority - bPriority;
            }
            return (b.progress || 0) - (a.progress || 0);
        });
        
        container.innerHTML = workspaces.map(workspace => this.renderWorkspace(workspace)).join('');
    }
    
    renderWorkspace(workspace) {
        const progress = workspace.progress || 0;
        
        return `
            <div class="workspace-card">
                <div class="workspace-header">
                    <div class="workspace-title">${this.escapeHtml(workspace.title || 'Untitled Workspace')}</div>
                    <div class="workspace-id">${workspace.id}</div>
                </div>
                <div style="font-size: 14px; color: #86868b; margin-bottom: 4px;">
                    Status: ${this.escapeHtml(workspace.status || 'Unknown')}
                </div>
                ${workspace.currentFocus ? 
                    `<div style="font-size: 12px; color: #1d1d1f; margin-bottom: 8px;">
                        🎯 ${this.escapeHtml(workspace.currentFocus)}
                    </div>` : ''
                }
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">
                    <span>${workspace.completedPhases || 0}/${workspace.totalPhases || 5} phases</span>
                    <span>${progress}%</span>
                </div>
                ${workspace.lastUpdated ? 
                    `<div style="font-size: 12px; color: #86868b; margin-top: 8px;">
                        Updated: ${new Date(workspace.lastUpdated).toLocaleString()}
                    </div>` : ''
                }
            </div>
        `;
    }
    
    renderActivity() {
        const container = document.getElementById('activity-container');
        
        if (this.activityLog.length === 0) {
            container.innerHTML = '<div class="empty-state">No recent activity</div>';
            return;
        }
        
        container.innerHTML = this.activityLog.map(activity => {
            const time = new Date(activity.timestamp).toLocaleTimeString();
            const emoji = this.getActivityEmoji(activity.type);
            
            return `
                <div class="activity-item">
                    <div class="activity-time">${time}</div>
                    <div>${emoji} ${activity.type} ${this.escapeHtml(activity.file)}</div>
                </div>
            `;
        }).join('');
    }
    
    getActivityEmoji(type) {
        const emojis = {
            'add': '📄',
            'change': '✏️',
            'delete': '🗑️'
        };
        return emojis[type] || '📝';
    }
    
    renderOverview() {
        const container = document.getElementById('overview-container');
        
        const taskCount = this.tasks.size;
        const workspaceCount = this.workspaces.size;
        
        // Calculate priority distribution
        const priorities = { p0: 0, p1: 0, p2: 0, p3: 0 };
        this.tasks.forEach(task => {
            priorities[task.priority] = (priorities[task.priority] || 0) + 1;
        });
        
        // Calculate average progress
        const totalProgress = Array.from(this.workspaces.values())
            .reduce((sum, ws) => sum + (ws.progress || 0), 0);
        const avgProgress = workspaceCount > 0 ? Math.round(totalProgress / workspaceCount) : 0;
        
        // Calculate overdue tasks
        const overdueTasks = Array.from(this.tasks.values())
            .filter(task => task.due && new Date(task.due) < new Date()).length;
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                    <div style="font-size: 24px; font-weight: 600; color: #1d1d1f;">${taskCount}</div>
                    <div style="font-size: 14px; color: #86868b;">Active Tasks</div>
                </div>
                <div>
                    <div style="font-size: 24px; font-weight: 600; color: #1d1d1f;">${workspaceCount}</div>
                    <div style="font-size: 14px; color: #86868b;">Workspaces</div>
                </div>
            </div>
            
            <div style="margin-bottom: 16px;">
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Priority Distribution</div>
                <div style="font-size: 14px; color: #86868b;">
                    <span style="color: #ff3b30;">●</span> P0: ${priorities.p0} • 
                    <span style="color: #ff9500;">●</span> P1: ${priorities.p1} • 
                    <span style="color: #34c759;">●</span> P2: ${priorities.p2} • 
                    <span style="color: #007aff;">●</span> P3: ${priorities.p3}
                </div>
            </div>
            
            <div style="margin-bottom: 16px;">
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Average Progress</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${avgProgress}%"></div>
                </div>
                <div style="font-size: 14px; color: #86868b; margin-top: 4px;">${avgProgress}% complete</div>
            </div>
            
            ${overdueTasks > 0 ? `
                <div style="background: #fff2f2; border: 1px solid #ffccc7; border-radius: 6px; padding: 12px;">
                    <div style="font-size: 14px; font-weight: 600; color: #ff3b30;">⚠️ ${overdueTasks} overdue task${overdueTasks === 1 ? '' : 's'}</div>
                    <div style="font-size: 12px; color: #86868b; margin-top: 4px;">Review and update due dates</div>
                </div>
            ` : ''}
        `;
    }
    
    updateStatus() {
        document.getElementById('task-count').textContent = `${this.tasks.size} tasks`;
        document.getElementById('workspace-count').textContent = `${this.workspaces.size} workspaces`;
        document.getElementById('last-update').textContent = `Updated: ${new Date().toLocaleTimeString()}`;
    }
    
    setConnectionStatus(connected) {
        this.isConnected = connected;
        const dot = document.getElementById('connection-dot');
        const text = document.getElementById('connection-text');
        
        if (connected) {
            dot.classList.remove('disconnected');
            text.textContent = 'Connected';
        } else {
            dot.classList.add('disconnected');
            text.textContent = 'Disconnected';
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    setupEventListeners() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isConnected) {
                // Refresh data when page becomes visible
                this.render();
            }
        });
        
        // Handle window focus
        window.addEventListener('focus', () => {
            if (this.isConnected) {
                this.render();
            }
        });
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new WorkspaceDashboard();
});