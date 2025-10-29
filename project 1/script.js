/**
 * Smart To-Do List Application
 * A comprehensive task management application with advanced features
 */

class TodoApp {
    constructor() {
        // Initialize properties
        this.tasks = [];
        this.currentFilter = 'all';
        this.currentSort = 'created';
        this.editingTaskId = null;
        
        // Initialize DOM elements
        this.initDOMElements();
        
        // Load tasks from localStorage
        this.loadTasks();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initial render
        this.render();
        
        // Show welcome message for first-time users
        this.showWelcomeMessage();
    }

    /**
     * Initialize DOM element references
     */
    initDOMElements() {
        // Input elements
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskPriority = document.getElementById('taskPriority');
        this.taskCategory = document.getElementById('taskCategory');
        this.taskDate = document.getElementById('taskDate');
        
        // Filter elements
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.sortBy = document.getElementById('sortBy');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        
        // Display elements
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        this.errorMessage = document.getElementById('errorMessage');
        
        // Statistics elements
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.pendingTasks = document.getElementById('pendingTasks');
        
        // Modal elements
        this.editModal = document.getElementById('editModal');
        this.overlay = document.getElementById('overlay');
        this.editTaskInput = document.getElementById('editTaskInput');
        this.editTaskPriority = document.getElementById('editTaskPriority');
        this.editTaskCategory = document.getElementById('editTaskCategory');
        this.editTaskDate = document.getElementById('editTaskDate');
        this.saveEditBtn = document.getElementById('saveEditBtn');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        this.closeModalBtn = document.querySelector('.close-btn');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Add task events
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        // Filter events
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
        
        // Sort event
        this.sortBy.addEventListener('change', (e) => this.setSort(e.target.value));
        
        // Clear all completed tasks
        this.clearAllBtn.addEventListener('click', () => this.clearCompletedTasks());
        
        // Modal events
        this.saveEditBtn.addEventListener('click', () => this.saveTaskEdit());
        this.cancelEditBtn.addEventListener('click', () => this.closeEditModal());
        this.closeModalBtn.addEventListener('click', () => this.closeEditModal());
        this.overlay.addEventListener('click', () => this.closeEditModal());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Auto-save on input change (debounced)
        let saveTimeout;
        document.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => this.saveTasks(), 500);
        });
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Escape key to close modal
        if (e.key === 'Escape' && this.editModal.classList.contains('show')) {
            this.closeEditModal();
        }
        
        // Ctrl/Cmd + Enter to add task
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this.addTask();
        }
    }

    /**
     * Generate unique ID for tasks
     */
    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Add a new task
     */
    addTask() {
        const text = this.taskInput.value.trim();
        const priority = this.taskPriority.value;
        const category = this.taskCategory.value;
        const dueDate = this.taskDate.value;
        
        // Validation
        if (!text) {
            this.showError('कृपया task description भरें! Please enter a task description!');
            this.taskInput.focus();
            return;
        }
        
        if (text.length > 200) {
            this.showError('Task description 200 characters से कम होना चाहिए!');
            return;
        }
        
        // Check for duplicate tasks
        if (this.tasks.some(task => task.text.toLowerCase() === text.toLowerCase())) {
            this.showError('यह task पहले से मौजूद है! This task already exists!');
            return;
        }
        
        // Create new task
        const newTask = {
            id: this.generateId(),
            text: text,
            completed: false,
            priority: priority,
            category: category,
            dueDate: dueDate || null,
            createdAt: new Date().toISOString(),
            completedAt: null
        };
        
        // Add to tasks array
        this.tasks.unshift(newTask); // Add to beginning for newest first
        
        // Clear form
        this.taskInput.value = '';
        this.taskDate.value = '';
        this.taskPriority.value = 'medium';
        this.taskCategory.value = 'personal';
        
        // Save and render
        this.saveTasks();
        this.render();
        
        // Focus input for next task
        this.taskInput.focus();
        
        // Show success feedback
        this.showSuccess('Task successfully जोड़ा गया! Task added successfully!');
    }

    /**
     * Toggle task completion status
     */
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            
            this.saveTasks();
            this.render();
            
            // Provide audio feedback
            this.playSound(task.completed ? 'complete' : 'uncomplete');
        }
    }

    /**
     * Delete a task with confirmation
     */
    deleteTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task && confirm(`क्या आप "${task.text}" को delete करना चाहते हैं?\nAre you sure you want to delete "${task.text}"?`)) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
            this.showSuccess('Task successfully हटाया गया! Task deleted successfully!');
        }
    }

    /**
     * Open edit modal for a task
     */
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.editingTaskId = id;
            this.editTaskInput.value = task.text;
            this.editTaskPriority.value = task.priority;
            this.editTaskCategory.value = task.category;
            this.editTaskDate.value = task.dueDate || '';
            
            this.showEditModal();
        }
    }

    /**
     * Save edited task
     */
    saveTaskEdit() {
        const text = this.editTaskInput.value.trim();
        const priority = this.editTaskPriority.value;
        const category = this.editTaskCategory.value;
        const dueDate = this.editTaskDate.value;
        
        // Validation
        if (!text) {
            this.showError('Task description नहीं हो सकती खाली! Task description cannot be empty!');
            this.editTaskInput.focus();
            return;
        }
        
        if (text.length > 200) {
            this.showError('Task description 200 characters से कम होनी चाहिए!');
            return;
        }
        
        // Update task
        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            task.text = text;
            task.priority = priority;
            task.category = category;
            task.dueDate = dueDate || null;
            
            this.saveTasks();
            this.render();
            this.closeEditModal();
            this.showSuccess('Task successfully अपडेट हुआ! Task updated successfully!');
        }
    }

    /**
     * Show edit modal
     */
    showEditModal() {
        this.editModal.classList.add('show');
        this.overlay.classList.add('show');
        this.editTaskInput.focus();
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close edit modal
     */
    closeEditModal() {
        this.editModal.classList.remove('show');
        this.overlay.classList.remove('show');
        this.editingTaskId = null;
        document.body.style.overflow = 'auto';
    }

    /**
     * Set active filter
     */
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }

    /**
     * Set sorting method
     */
    setSort(sortBy) {
        this.currentSort = sortBy;
        this.render();
    }

    /**
     * Clear all completed tasks
     */
    clearCompletedTasks() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            this.showError('कोई completed tasks नहीं हैं! No completed tasks to clear!');
            return;
        }
        
        if (confirm(`${completedCount} completed tasks को delete करना चाहते हैं?\nAre you sure you want to delete ${completedCount} completed tasks?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
            this.showSuccess(`${completedCount} completed tasks हटाए गए! ${completedCount} completed tasks cleared!`);
        }
    }

    /**
     * Filter tasks based on current filter
     */
    getFilteredTasks() {
        let filtered = [...this.tasks];
        
        // Apply filter
        switch (this.currentFilter) {
            case 'pending':
                filtered = filtered.filter(t => !t.completed);
                break;
            case 'completed':
                filtered = filtered.filter(t => t.completed);
                break;
            default:
                // 'all' - no filtering needed
                break;
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                
                case 'dueDate':
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                
                case 'category':
                    return a.category.localeCompare(b.category);
                
                default: // 'created'
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
        
        return filtered;
    }

    /**
     * Render the task list
     */
    render() {
        const filteredTasks = this.getFilteredTasks();
        
        // Update statistics
        this.updateStatistics();
        
        // Clear current list
        this.taskList.innerHTML = '';
        
        // Show/hide empty state
        if (filteredTasks.length === 0) {
            this.emptyState.style.display = 'block';
            this.taskList.style.display = 'none';
        } else {
            this.emptyState.style.display = 'none';
            this.taskList.style.display = 'flex';
            
            // Render tasks
            filteredTasks.forEach(task => {
                this.taskList.appendChild(this.createTaskElement(task));
            });
        }
        
        // Update clear button visibility
        const hasCompleted = this.tasks.some(t => t.completed);
        this.clearAllBtn.style.display = hasCompleted ? 'flex' : 'none';
    }

    /**
     * Create HTML element for a task
     */
    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.setAttribute('data-id', task.id);
        
        // Check if task is overdue or due soon
        const dueDateStatus = this.getDueDateStatus(task.dueDate);
        
        li.innerHTML = `
            <div class="task-content">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                     onclick="todoApp.toggleTask('${task.id}')"
                     role="checkbox" 
                     aria-checked="${task.completed}"
                     tabindex="0"></div>
                <span class="task-text ${task.completed ? 'completed' : ''}">${this.escapeHtml(task.text)}</span>
                <span class="task-priority ${task.priority}">${task.priority}</span>
            </div>
            
            <div class="task-meta">
                <span class="task-category">${task.category}</span>
                ${task.dueDate ? `<span class="task-due-date ${dueDateStatus.class}">${dueDateStatus.text}</span>` : ''}
            </div>
            
            <div class="task-actions">
                <button class="task-action-btn edit-btn" 
                        onclick="todoApp.editTask('${task.id}')"
                        aria-label="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action-btn delete-btn" 
                        onclick="todoApp.deleteTask('${task.id}')"
                        aria-label="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add keyboard support for checkbox
        const checkbox = li.querySelector('.task-checkbox');
        checkbox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleTask(task.id);
            }
        });
        
        return li;
    }

    /**
     * Get due date status for styling
     */
    getDueDateStatus(dueDate) {
        if (!dueDate) return { text: '', class: '' };
        
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return {
                text: `${Math.abs(diffDays)} days overdue`,
                class: 'overdue'
            };
        } else if (diffDays === 0) {
            return {
                text: 'Due today',
                class: 'due-soon'
            };
        } else if (diffDays === 1) {
            return {
                text: 'Due tomorrow',
                class: 'due-soon'
            };
        } else if (diffDays <= 3) {
            return {
                text: `Due in ${diffDays} days`,
                class: 'due-soon'
            };
        } else {
            return {
                text: `Due ${due.toLocaleDateString()}`,
                class: ''
            };
        }
    }

    /**
     * Update statistics display
     */
    updateStatistics() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        this.totalTasks.textContent = total;
        this.completedTasks.textContent = completed;
        this.pendingTasks.textContent = pending;
        
        // Animate numbers
        this.animateNumber(this.totalTasks);
        this.animateNumber(this.completedTasks);
        this.animateNumber(this.pendingTasks);
    }

    /**
     * Animate number changes
     */
    animateNumber(element) {
        element.style.transform = 'scale(1.1)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }

    /**
     * Save tasks to localStorage
     */
    saveTasks() {
        try {
            localStorage.setItem('todoApp_tasks', JSON.stringify(this.tasks));
            localStorage.setItem('todoApp_lastSaved', new Date().toISOString());
        } catch (error) {
            console.error('Error saving tasks:', error);
            this.showError('Tasks save नहीं हो सके! Could not save tasks!');
        }
    }

    /**
     * Load tasks from localStorage
     */
    loadTasks() {
        try {
            const savedTasks = localStorage.getItem('todoApp_tasks');
            if (savedTasks) {
                this.tasks = JSON.parse(savedTasks);
                
                // Migrate old task format if needed
                this.tasks = this.tasks.map(task => ({
                    id: task.id || this.generateId(),
                    text: task.text || '',
                    completed: task.completed || false,
                    priority: task.priority || 'medium',
                    category: task.category || 'personal',
                    dueDate: task.dueDate || null,
                    createdAt: task.createdAt || new Date().toISOString(),
                    completedAt: task.completedAt || null
                }));
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showError('Tasks load नहीं हो सके! Could not load tasks!');
            this.tasks = [];
        }
    }

    /**
     * Export tasks to JSON file
     */
    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showSuccess('Tasks successfully export हो गए! Tasks exported successfully!');
    }

    /**
     * Import tasks from JSON file
     */
    importTasks(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTasks = JSON.parse(e.target.result);
                if (Array.isArray(importedTasks)) {
                    this.tasks = importedTasks;
                    this.saveTasks();
                    this.render();
                    this.showSuccess('Tasks successfully import हो गए! Tasks imported successfully!');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                this.showError('Invalid file format! कृपया valid JSON file select करें!');
            }
        };
        reader.readAsText(file);
    }

    /**
     * Show error message
     */
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add('show');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.errorMessage.classList.remove('show');
        }, 5000);
        
        // Play error sound
        this.playSound('error');
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        // Create temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(successDiv);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            successDiv.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(successDiv);
            }, 300);
        }, 3000);
        
        // Play success sound
        this.playSound('success');
    }

    /**
     * Play sound feedback (if audio is available)
     */
    playSound(type) {
        // Create audio context for sound feedback
        if (typeof(AudioContext) !== "undefined" || typeof(webkitAudioContext) !== "undefined") {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // Different sounds for different actions
                switch (type) {
                    case 'complete':
                        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
                        break;
                    case 'uncomplete':
                        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                        break;
                    case 'error':
                        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                        break;
                    case 'success':
                        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                        break;
                }
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
            } catch (error) {
                // Silently fail if audio is not available
            }
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show welcome message for first-time users
     */
    showWelcomeMessage() {
        if (this.tasks.length === 0 && !localStorage.getItem('todoApp_welcomed')) {
            setTimeout(() => {
                this.showSuccess('Welcome to Smart To-Do List! अपना पहला task add करें!');
                localStorage.setItem('todoApp_welcomed', 'true');
            }, 1000);
        }
    }

    /**
     * Get app statistics for display
     */
    getAppStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const overdue = this.tasks.filter(t => {
            if (!t.dueDate || t.completed) return false;
            return new Date(t.dueDate) < new Date();
        }).length;
        
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return {
            total,
            completed,
            pending: total - completed,
            overdue,
            completionRate
        };
    }
}

// Additional CSS for success messages
const additionalStyles = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;

// Add additional styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the app when DOM is loaded
let todoApp;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        todoApp = new TodoApp();
    });
} else {
    todoApp = new TodoApp();
}

// Export functions for import/export features
window.exportTasks = () => todoApp.exportTasks();
window.importTasks = (file) => todoApp.importTasks(file);

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Handle app updates
window.addEventListener('beforeunload', () => {
    if (todoApp) {
        todoApp.saveTasks();
    }
});
