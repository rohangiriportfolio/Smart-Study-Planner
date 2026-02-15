document.addEventListener('DOMContentLoaded', () => {
  const storageKey = 'smartStudyTasks';
  let tasks = JSON.parse(localStorage.getItem(storageKey) || '[]');

  const saveTasks = () => localStorage.setItem(storageKey, JSON.stringify(tasks));

  function renderTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = tasks.length === 0
      ? '<p style="color:#999; text-align:center; padding:20px;">No tasks yet.</p>'
      : '';

    tasks.forEach((task, idx) => {
      const div = document.createElement('div');
      div.className = `task-row ${task.done ? 'done' : ''}`;
      div.innerHTML = `
        <div class="task-info">
          <span class="task-subject">📘 ${task.subject} - ${task.topic}</span>
          <span class="task-meta">📅 ${task.date} | ⏰ ${task.time}</span>
        </div>
        <div class="task-actions">
          <button onclick="toggleDone(${idx})" class="${task.done ? 'undo-btn' : 'check-btn'}">
            <i class="material-icons">${task.done ? 'undo' : 'check_circle'}</i>
          </button>
          <button onclick="deleteTask(${idx})" class="delete-btn">
            <i class="material-icons">delete</i>
          </button>
        </div>
      `;
      taskList.appendChild(div);
    });
  }

  window.toggleDone = (idx) => {
    tasks[idx].done = !tasks[idx].done;
    saveTasks();
    renderTasks();
  };

  window.deleteTask = (idx) => {
    tasks.splice(idx, 1);
    saveTasks();
    renderTasks();
  };

  function requestNotificationPermission() {
    if (!('Notification' in window)) return; // Browser doesn't support
    if (Notification.permission === 'default') {
      // Ask permission
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        } else if (permission === 'denied') {
          console.warn('Notification permission denied.');
        }
      });
    } else if (Notification.permission === 'denied') {
      alert('You have blocked notifications. To receive reminders, enable them in your browser settings.');
    }
    // If already granted, nothing to do
  }

  document.getElementById('task-form').addEventListener('submit', (e) => {
    e.preventDefault();

    // Request permission on user action
    requestNotificationPermission();

    tasks.push({
      subject: document.getElementById('subject').value,
      topic: document.getElementById('topic').value,
      date: document.getElementById('task-date').value,
      time: document.getElementById('task-time').value,
      done: false,
      notified: false
    });

    saveTasks();
    renderTasks();
    e.target.reset();

    // Reset MDL UI state
    const containers = e.target.querySelectorAll('.mdl-textfield');
    containers.forEach(c => {
      c.classList.remove('is-dirty', 'is-focused');
    });
  });

  setInterval(() => {
    const now = new Date();
    tasks.forEach((task, idx) => {
      if (task.done || task.notified) return;
      const t = new Date(`${task.date}T${task.time}:00`);
      if (t - now > 0 && t - now < 60000) {
        if (Notification.permission === 'granted') {
          new Notification('Study Reminder', { body: `${task.subject}: ${task.topic}` });
        }
        tasks[idx].notified = true;
        saveTasks();
      }
    });
  }, 10000);

  renderTasks();
});
