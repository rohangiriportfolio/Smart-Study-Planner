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

  // Toggle task done
  window.toggleDone = (idx) => {
    tasks[idx].done = !tasks[idx].done;
    saveTasks();
    renderTasks();
  };

  // Delete task
  window.deleteTask = (idx) => {
    tasks.splice(idx, 1);
    saveTasks();
    renderTasks();
  };

  // Add task
  const form = document.getElementById('task-form');
  const addBtn = document.getElementById('add-btn');

  // Ask notification permission on button click
  addBtn.addEventListener('click', (e) => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notifications enabled');
        } else if (permission === 'denied') {
          alert('You blocked notifications. Enable them in browser settings.');
        }
      });
    } else if (Notification.permission === 'denied') {
      alert('Notifications are blocked. Enable them in your browser settings to receive reminders.');
    }
  });

  // Submit form to save task
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const subject = document.getElementById('subject').value.trim();
    const topic = document.getElementById('topic').value.trim();
    const date = document.getElementById('task-date').value;
    const time = document.getElementById('task-time').value;

    if (!subject || !topic || !date || !time) return;

    tasks.push({
      subject,
      topic,
      date,
      time,
      done: false,
      notified: false
    });

    saveTasks();
    renderTasks();
    e.target.reset();

    // Reset MDL labels
    const containers = form.querySelectorAll('.mdl-textfield');
    containers.forEach(c => {
      c.classList.remove('is-dirty');
      c.classList.remove('is-focused');
    });
  });

  // Notification check every 10 seconds
  setInterval(() => {
    if (Notification.permission !== 'granted') return;

    const now = new Date();
    tasks.forEach((task, idx) => {
      if (task.done || task.notified) return;
      const taskTime = new Date(`${task.date}T${task.time}:00`);
      const diff = taskTime - now;
      if (diff > 0 && diff < 60000) { // within next 60 seconds
        new Notification('Study Reminder', { body: `${task.subject}: ${task.topic}` });
        tasks[idx].notified = true;
        saveTasks();
      }
    });
  }, 10000);

  renderTasks();
});
