class WorkspaceDashboard {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.tasks = new Map();
        this.archivedTasks = [];
        this.currentModalTaskId = null;
        this.currentModalIsCompleted = false;

        this.init();
    }

    init() {
        this.setupWebSocket();
        this.setupEventListeners();
        this.setupModalListeners();
    }

    setupWebSocket() {
        try {
            this.ws = new WebSocket('ws://localhost:8080');

            this.ws.onopen = () => {
                console.log('Connected to workspace server');
                this.setConnectionStatus(true);
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };

            this.ws.onclose = () => {
                console.log('Disconnected from workspace server');
                this.setConnectionStatus(false);
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
        this.tasks.clear();
        data.tasks.forEach(task => {
            this.tasks.set(task.id, task);
        });

        this.archivedTasks = data.archivedTasks || [];

        this.render();
        this.updateStatus();
        console.log(`Loaded ${this.tasks.size} tasks, ${this.archivedTasks.length} archived`);
    }

    handleFileUpdate(data) {
        if (data.data) {
            if (data.data.tasks) {
                this.tasks.clear();
                data.data.tasks.forEach(task => {
                    this.tasks.set(task.id, task);
                });
            }

            if (data.data.archivedTasks) {
                this.archivedTasks = data.data.archivedTasks;
            }
        }

        this.render();
        this.updateStatus();

        // Refresh modal if it's open
        if (this.currentModalTaskId) {
            this.openTaskModal(this.currentModalTaskId, this.currentModalIsCompleted);
        }
    }

    render() {
        this.renderOverview();
        this.renderTasks();
        this.renderCompletedTasks();
    }

    renderOverview() {
        const container = document.getElementById('overview-container');
        const taskCount = this.tasks.size;

        // Calculate priority distribution
        const priorities = { p0: 0, p1: 0, p2: 0, p3: 0 };
        this.tasks.forEach(task => {
            priorities[task.priority] = (priorities[task.priority] || 0) + 1;
        });

        // Calculate status distribution
        const statuses = { 'Not Started': 0, 'Ongoing': 0, 'Finished': 0 };
        this.tasks.forEach(task => {
            const status = task.taskStatus || 'Not Started';
            statuses[status] = (statuses[status] || 0) + 1;
        });

        // Calculate overdue tasks
        const today = this.getTodayString();
        const overdueTasks = Array.from(this.tasks.values())
            .filter(task => task.due && task.due < today).length;

        // Calculate due today
        const dueTodayTasks = Array.from(this.tasks.values())
            .filter(task => task.due && task.due === today).length;

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px;">
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: 600; color: #1d1d1f;">${taskCount}</div>
                    <div style="font-size: 14px; color: #86868b;">Active Tasks</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: 600; color: #007aff;">${statuses['Ongoing']}</div>
                    <div style="font-size: 14px; color: #86868b;">In Progress</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: 600; color: #34c759;">${this.archivedTasks.length}</div>
                    <div style="font-size: 14px; color: #86868b;">Recently Completed</div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Priority Distribution</div>
                    <div style="font-size: 13px; color: #86868b;">
                        <span style="color: #ff3b30;">&#9679;</span> P0: ${priorities.p0} &nbsp;
                        <span style="color: #ff9500;">&#9679;</span> P1: ${priorities.p1}<br>
                        <span style="color: #34c759;">&#9679;</span> P2: ${priorities.p2} &nbsp;
                        <span style="color: #007aff;">&#9679;</span> P3: ${priorities.p3}
                    </div>
                </div>
                <div>
                    <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Status Distribution</div>
                    <div style="font-size: 13px; color: #86868b;">
                        <span style="color: #636366;">&#9679;</span> Not Started: ${statuses['Not Started']}<br>
                        <span style="color: #007aff;">&#9679;</span> Ongoing: ${statuses['Ongoing']}<br>
                        <span style="color: #34c759;">&#9679;</span> Finished: ${statuses['Finished']}
                    </div>
                </div>
            </div>

            ${overdueTasks > 0 || dueTodayTasks > 0 ? `
                <div style="margin-top: 16px; display: flex; gap: 12px;">
                    ${overdueTasks > 0 ? `
                        <div style="flex: 1; background: #ffebee; border: 1px solid #ffcdd2; border-radius: 6px; padding: 12px;">
                            <div style="font-size: 14px; font-weight: 600; color: #c62828;">${overdueTasks} overdue task${overdueTasks === 1 ? '' : 's'}</div>
                        </div>
                    ` : ''}
                    ${dueTodayTasks > 0 ? `
                        <div style="flex: 1; background: #fff3e0; border: 1px solid #ffe0b2; border-radius: 6px; padding: 12px;">
                            <div style="font-size: 14px; font-weight: 600; color: #e65100;">${dueTodayTasks} due today</div>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
        `;
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
        const today = this.getTodayString();

        let dueClass = '';
        let dueText = 'No deadline';

        if (task.due) {
            if (task.due < today) {
                dueClass = 'overdue';
                dueText = `Overdue (${task.due})`;
            } else if (task.due === today) {
                dueClass = 'due-today';
                dueText = `Due Today`;
            } else {
                dueText = `Due: ${task.due}`;
            }
        }

        const statusClass = (task.taskStatus || 'Not Started').toLowerCase().replace(/\s+/g, '-');

        // Build due date badge
        let dueBadge = '';
        if (task.due) {
            if (dueClass === 'overdue') {
                dueBadge = `<div style="background: #ff3b30; color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">⚠ ${dueText}</div>`;
            } else if (dueClass === 'due-today') {
                dueBadge = `<div style="background: #ff9500; color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">📅 ${dueText}</div>`;
            } else {
                dueBadge = `<div style="background: #e5e5ea; color: #636366; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500;">${dueText}</div>`;
            }
        }

        return `
            <div class="task-card priority-${task.priority}" onclick="dashboard.openTaskModal('${task.id}', false)">
                <div class="task-header">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    <div class="task-badges">
                        ${dueBadge}
                        <div class="task-status ${statusClass}">${this.escapeHtml(task.taskStatus || 'Not Started')}</div>
                        <div class="task-priority ${task.priority}">${task.priority.toUpperCase()}</div>
                    </div>
                </div>
                ${task.context ? `<div class="task-context">${this.escapeHtml(task.context)}</div>` : ''}
                <div class="task-meta">
                    ID: ${task.id} &bull; Created: ${task.created}
                </div>
                ${task.tags && task.tags.length ?
                    `<div style="margin-top: 8px; font-size: 12px; color: #86868b;">
                        ${task.tags.map(tag => `<span style="background: #f2f2f7; padding: 2px 6px; border-radius: 4px; margin-right: 4px;">${this.escapeHtml(tag)}</span>`).join('')}
                    </div>` : ''
                }
            </div>
        `;
    }

    renderCompletedTasks() {
        const container = document.getElementById('completed-container');

        if (this.archivedTasks.length === 0) {
            container.innerHTML = '';
            return;
        }

        const tasksHtml = this.archivedTasks.map(task => `
            <div class="task-card completed priority-${task.priority}" onclick="dashboard.openTaskModal('${task.id}', true)">
                <div class="task-header">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    <div class="task-badges">
                        <div class="task-priority ${task.priority}">${task.priority.toUpperCase()}</div>
                    </div>
                </div>
                <div class="task-meta">
                    Completed: ${task.completed || 'Unknown'}
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="completed-section">
                <h3>Recently Completed</h3>
                ${tasksHtml}
            </div>
        `;
    }

    async openTaskModal(taskId, isCompleted) {
        const modalOverlay = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        // Track current modal for real-time updates
        this.currentModalTaskId = taskId;
        this.currentModalIsCompleted = isCompleted;

        let task;
        if (isCompleted) {
            task = this.archivedTasks.find(t => t.id === taskId);
        } else {
            task = this.tasks.get(taskId);
        }

        if (!task) {
            console.error('Task not found:', taskId);
            return;
        }

        modalTitle.textContent = task.title;

        const statusClass = (task.taskStatus || 'Not Started').toLowerCase().replace(/\s+/g, '-');

        // Build due date banner if applicable
        let dueBanner = '';
        if (task.due && !isCompleted) {
            const dueClass = this.getDueClass(task.due);
            if (dueClass === 'overdue') {
                dueBanner = `<div style="background: #ffebee; border: 1px solid #ffcdd2; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">⚠️</span>
                    <div>
                        <div style="font-weight: 600; color: #c62828;">Overdue</div>
                        <div style="font-size: 13px; color: #c62828;">Was due on ${task.due}</div>
                    </div>
                </div>`;
            } else if (dueClass === 'due-today') {
                dueBanner = `<div style="background: #fff3e0; border: 1px solid #ffe0b2; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">📅</span>
                    <div>
                        <div style="font-weight: 600; color: #e65100;">Due Today</div>
                        <div style="font-size: 13px; color: #e65100;">${task.due}</div>
                    </div>
                </div>`;
            }
        }

        // Build metadata section
        let content = dueBanner + `
            <div class="modal-section">
                <h4>Task Details</h4>
                <div class="task-meta-grid">
                    <div class="meta-item">
                        <span class="meta-label">ID</span>
                        <span class="meta-value" style="font-family: monospace;">${task.id}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Priority</span>
                        <span class="meta-badge priority-${task.priority}">${task.priority.toUpperCase()}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Status</span>
                        <span class="meta-badge status-${statusClass}">${task.taskStatus || 'Not Started'}</span>
                    </div>
                    ${isCompleted ? `
                        <div class="meta-item">
                            <span class="meta-label">Completed</span>
                            <span class="meta-value" style="color: #34c759; font-weight: 600;">${task.completed || 'Unknown'}</span>
                        </div>
                    ` : `
                        <div class="meta-item">
                            <span class="meta-label">Created</span>
                            <span class="meta-value">${task.created}</span>
                        </div>
                    `}
                    ${task.due ? `
                        <div class="meta-item">
                            <span class="meta-label">Due Date</span>
                            <span class="meta-value ${this.getDueClass(task.due)}" style="font-weight: 600;">${task.due}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Tags section
        if (task.tags && task.tags.length) {
            content += `
                <div class="modal-section">
                    <h4>Tags</h4>
                    <div class="tags-list">
                        ${task.tags.map(tag => `<span class="tag-badge">${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        // Context section
        if (task.context) {
            content += `
                <div class="modal-section">
                    <h4>Context</h4>
                    <div class="context-box">${this.escapeHtml(task.context)}</div>
                </div>
            `;
        }

        // Try to fetch workspace progress
        try {
            const response = await fetch(`/api/workspace/${taskId}/progress`);
            if (response.ok) {
                const progress = await response.json();
                // If task is completed, show 100% progress
                if (isCompleted) {
                    progress.progress = 100;
                    progress.status = 'Completed';
                }
                content += this.renderProgressSection(progress);
            } else if (isCompleted) {
                // Completed task without workspace - show 100% completion
                content += `
                    <div class="modal-section">
                        <h4>Workspace Progress</h4>
                        <div class="progress-section">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <span style="font-weight: 600; color: #34c759;">100% Complete</span>
                                <span style="font-size: 12px; color: #86868b;">Completed</span>
                            </div>
                            <div class="progress-bar" style="height: 8px;">
                                <div class="progress-fill" style="width: 100%"></div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                content += `
                    <div class="modal-section">
                        <h4>Workspace</h4>
                        <div class="no-workspace">
                            <div class="no-workspace-icon">📁</div>
                            <div>No workspace created for this task</div>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            content += `
                <div class="modal-section">
                    <h4>Workspace</h4>
                    <div class="no-workspace">
                        <div class="no-workspace-icon">📁</div>
                        <div>No workspace created for this task</div>
                    </div>
                </div>
            `;
        }

        modalBody.innerHTML = content;
        modalOverlay.classList.add('active');
    }

    getTodayString() {
        const today = new Date();
        return today.getFullYear() + '-' +
               String(today.getMonth() + 1).padStart(2, '0') + '-' +
               String(today.getDate()).padStart(2, '0');
    }

    getDueClass(due) {
        if (!due) return '';
        const today = this.getTodayString();

        if (due < today) return 'overdue';
        if (due === today) return 'due-today';
        return '';
    }

    renderProgressSection(progress) {
        let html = `
            <div class="modal-section">
                <h4>Workspace Progress</h4>
                <div class="progress-section">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span style="font-weight: 600; color: #1d1d1f;">${progress.progress}% Complete</span>
                        <span style="font-size: 12px; color: #86868b;">${progress.status}</span>
                    </div>
                    <div class="progress-bar" style="height: 8px;">
                        <div class="progress-fill" style="width: ${progress.progress}%"></div>
                    </div>
                </div>
                <div class="progress-section">
                    <div class="progress-content">${this.renderMarkdown(progress.raw)}</div>
                </div>
            </div>
        `;
        return html;
    }

    renderMarkdown(raw) {
        // Split into lines and process
        const lines = raw.split('\n');
        let html = '';
        let inList = false;

        for (let i = 0; i < lines.length; i++) {
            let line = this.escapeHtml(lines[i]);
            const trimmed = line.trim();

            // Skip empty lines within lists
            if (trimmed === '' && inList) {
                continue;
            }

            // Headers
            if (trimmed.startsWith('# ')) {
                inList = false;
                html += `<h1 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0; color: #1d1d1f;">${trimmed.slice(2)}</h1>`;
                continue;
            }
            if (trimmed.startsWith('## ')) {
                inList = false;
                html += `<h2 style="font-size: 15px; font-weight: 600; margin: 20px 0 12px 0; color: #1d1d1f; border-bottom: 1px solid #e5e5ea; padding-bottom: 8px;">${trimmed.slice(3)}</h2>`;
                continue;
            }
            if (trimmed.startsWith('### ')) {
                inList = false;
                html += `<h3 style="font-size: 14px; font-weight: 600; margin: 16px 0 8px 0; color: #007aff;">${trimmed.slice(4)}</h3>`;
                continue;
            }

            // Status line with progress
            if (trimmed.includes('**Status:**') && trimmed.includes('**Progress:**')) {
                inList = false;
                const statusMatch = trimmed.match(/\*\*Status:\*\* ([^|]+)/);
                const progressMatch = trimmed.match(/\*\*Progress:\*\* (\d+)%/);
                if (statusMatch && progressMatch) {
                    html += `<div style="display: flex; gap: 16px; margin-bottom: 16px;"><span style="background: #007aff; color: white; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">${statusMatch[1].trim()}</span><span style="background: #34c759; color: white; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">${progressMatch[1]}% Complete</span></div>`;
                    continue;
                }
            }

            // Checkboxes - completed
            if (trimmed.startsWith('- [x] ')) {
                inList = true;
                const text = trimmed.slice(6);
                html += `<div style="display: flex; align-items: flex-start; gap: 8px; margin: 4px 0; color: #86868b;"><span style="color: #34c759; font-size: 14px;">✓</span><span style="text-decoration: line-through;">${text}</span></div>`;
                continue;
            }

            // Checkboxes - incomplete
            if (trimmed.startsWith('- [ ] ')) {
                inList = true;
                const text = trimmed.slice(6);
                html += `<div style="display: flex; align-items: flex-start; gap: 8px; margin: 4px 0;"><span style="color: #86868b; font-size: 14px;">○</span><span>${text}</span></div>`;
                continue;
            }

            // Bullet points
            if (trimmed.startsWith('- ')) {
                inList = true;
                let text = trimmed.slice(2);
                // Bold text
                text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                html += `<div style="display: flex; align-items: flex-start; gap: 8px; margin: 4px 0;"><span style="color: #007aff;">•</span><span>${text}</span></div>`;
                continue;
            }

            // Empty line (paragraph break)
            if (trimmed === '') {
                inList = false;
                html += '<div style="margin: 8px 0;"></div>';
                continue;
            }

            // Regular text with bold support
            inList = false;
            line = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            html += `<div style="margin: 4px 0;">${line}</div>`;
        }

        return html;
    }

    closeModal() {
        const modalOverlay = document.getElementById('modal-overlay');
        modalOverlay.classList.remove('active');
        this.currentModalTaskId = null;
        this.currentModalIsCompleted = false;
    }

    setupModalListeners() {
        const modalOverlay = document.getElementById('modal-overlay');

        // Close on overlay click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.closeModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    updateStatus() {
        document.getElementById('task-count').textContent = `${this.tasks.size} tasks`;
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
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setupEventListeners() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isConnected) {
                this.render();
            }
        });

        window.addEventListener('focus', () => {
            if (this.isConnected) {
                this.render();
            }
        });
    }
}

// Initialize dashboard and expose globally for onclick handlers
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new WorkspaceDashboard();
});
