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

  window.toggleDone = (idx) => { tasks[idx].done = !tasks[idx].done; saveTasks(); renderTasks(); };
  window.deleteTask = (idx) => { tasks.splice(idx, 1); saveTasks(); renderTasks(); };

  // Optimized Submit Handler
  document.getElementById('task-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const proceedWithTask = () => {
      addTask();
    };

    if (!("Notification" in window)) {
      alert("Browser does not support notifications.");
      proceedWithTask();
    } else if (Notification.permission === 'granted') {
      proceedWithTask();
    } else if (Notification.permission !== 'denied') {
      // This is the critical part that triggers the "Ask" prompt
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log("Notification enabled");
        }
        proceedWithTask();
      });
    } else {
      // Permission is denied
      alert("Notifications are blocked. Please enable them in your browser settings to receive study reminders.");
      proceedWithTask();
    }
  });

  function addTask() {
    const form = document.getElementById('task-form');
    const subject = document.getElementById('subject').value.trim();
    const topic = document.getElementById('topic').value.trim();
    const date = document.getElementById('task-date').value;
    const time = document.getElementById('task-time').value;

    if (!subject || !topic || !date || !time) return;

    tasks.push({ subject, topic, date, time, done: false, notified: false });
    saveTasks();
    renderTasks();

    form.reset();
    const containers = form.querySelectorAll('.mdl-textfield');
    containers.forEach(c => {
      c.classList.remove('is-dirty');
      c.classList.remove('is-focused');
    });
  }

  // Check for upcoming tasks
  setInterval(() => {
    if (Notification.permission !== 'granted') return;
    const now = new Date();
    tasks.forEach((task, idx) => {
      if (task.done || task.notified) return;
      const taskTime = new Date(`${task.date}T${task.time}:00`);
      const diff = taskTime - now;
      if (diff > 0 && diff < 60000) {
        new Notification('📚 Study Reminder', { 
            body: `Time to study ${task.subject}: ${task.topic}`,
            icon: 'favicon.png' 
        });
        tasks[idx].notified = true;
        saveTasks();
      }
    });
  }, 10000);

  renderTasks();
});
