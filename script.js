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

  // Listen for the FORM submit instead of just the button click
  document.getElementById('task-form').addEventListener('submit', function(e) {
    e.preventDefault();

    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
      addTask();
      return;
    }

    // Direct request: if permission is 'default' (not yet asked)
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log("Permission granted!");
        } else {
          alert('Reminders are disabled because permission was denied.');
        }
        addTask();
      });
    } else if (Notification.permission === 'denied') {
      alert('Notifications are blocked in browser settings. Please enable them to get reminders.');
      addTask();
    } else {
      addTask(); // Already granted
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

  setInterval(() => {
    if (Notification.permission !== 'granted') return;

    const now = new Date();
    tasks.forEach((task, idx) => {
      if (task.done || task.notified) return;
      const taskTime = new Date(`${task.date}T${task.time}:00`);
      const diff = taskTime - now;
      
      // Notify if task is within the next 60 seconds
      if (diff > 0 && diff < 60000) {
        new Notification('📚 Study Reminder', { 
            body: `Time for ${task.subject}: ${task.topic}`,
            icon: 'favicon.png' 
        });
        tasks[idx].notified = true;
        saveTasks();
      }
    });
  }, 10000);

  renderTasks();
});
