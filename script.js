class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.initializeElements();
        this.bindEvents();
        this.renderTasks();
        this.updateProgress();
    }

    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.dueDateInput = document.getElementById('dueDateInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskList = document.getElementById('taskList');
        this.taskTotal = document.getElementById('taskTotal');
        this.completedTotal = document.getElementById('completedTotal');
        this.progressFill = document.getElementById('progressFill');
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.notificationContainer = document.getElementById('notificationContainer');
    }

    bindEvents() {
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        this.navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderTasks(btn.dataset.filter);
            });
        });
    }

    addTask() {
        const title = this.taskInput.value.trim();
        const priority = this.prioritySelect.value;
        const dueDate = this.dueDateInput.value;

        if (!title) {
            this.showNotification('Judul tugas tidak boleh kosong!', 'error');
            return;
        }

        const task = {
            id: Date.now(),
            title,
            priority,
            dueDate,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveToLocalStorage();
        this.renderTasks();
        this.updateProgress();
        this.resetInputs();
        this.showNotification('Tugas berhasil ditambahkan!');
    }

    renderTasks(filter = 'all') {
        this.taskList.innerHTML = '';
        const filteredTasks = this.filterTasks(filter);

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.classList.add('task-item', `priority-${task.priority}`);
            li.innerHTML = `
                <div>
                    <span class="task-title ${task.completed ? 'completed' : ''}">${task.title}</span>
                    <small>${task.dueDate || 'Tanpa batas waktu'}</small>
                </div>
                <div class="task-actions">
                    <button class="toggle-btn" data-id="${task.id}">
                        <i class="ri-checkbox-${task.completed ? 'fill' : 'line'}"></i>
                    </button>
                    <button class="delete-btn" data-id="${task.id}">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            `;

            const toggleBtn = li.querySelector('.toggle-btn');
            const deleteBtn = li.querySelector('.delete-btn');

            toggleBtn.addEventListener('click', () => this.toggleTaskStatus(task.id));
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

            this.taskList.appendChild(li);
        });

        this.updateStats();
    }

    filterTasks(filter) {
        switch(filter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    toggleTaskStatus(id) {
        const task = this.tasks.find(t => t.id === id);
        task.completed = !task.completed;
        this.saveToLocalStorage();
        this.renderTasks();
        this.updateProgress();
        this.showNotification(task.completed ? 'Tugas diselesaikan!' : 'Tugas dikembalikan');
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveToLocalStorage();
        this.renderTasks();
        this.updateProgress();
        this.showNotification('Tugas dihapus');
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        this.taskTotal.textContent = `${totalTasks} Tugas`;
        this.completedTotal.textContent = `${completedTasks} Selesai`;
    }

    updateProgress() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const progressPercentage = totalTasks > 0 
            ? (completedTasks / totalTasks) * 100 
            : 0;
        
        this.progressFill.style.width = `${progressPercentage}%`;
    }

    saveToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    resetInputs() {
        this.taskInput.value = '';
        this.prioritySelect.value = 'normal';
        this.dueDateInput.value = '';
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.classList.add('notification', type);
        notification.textContent = message;
        this.notificationContainer.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});