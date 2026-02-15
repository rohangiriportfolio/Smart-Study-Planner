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

  // Handle add button click directly
  const addBtn = document.querySelector('#task-form button[type="submit"]');
  addBtn.addEventListener('click', (e) => {
    e.preventDefault(); // stop default form submit

    // Ask for permission if not granted
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
          alert('Enable notifications to receive reminders.');
        } else {
          addTask();
        }
      });
    } else {
      addTask();
    }
  });

  function addTask() {
    const form = document.getElementById('task-form');
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

    // Reset form and MDL label state
    form.reset();
    const containers = form.querySelectorAll('.mdl-textfield');
    containers.forEach(c => {
      c.classList.remove('is-dirty');
      c.classList.remove('is-focused');
    });
  }

  // Check tasks every 10 seconds
  setInterval(() => {
    if (Notification.permission !== 'granted') return;

    const now = new Date();
    tasks.forEach((task, idx) => {
      if (task.done || task.notified) return;
      const taskTime = new Date(`${task.date}T${task.time}:00`);
      if (taskTime - now > 0 && taskTime - now < 60000) {
        new Notification('Study Reminder', { body: `${task.subject}: ${task.topic}` });
        tasks[idx].notified = true;
        saveTasks();
      }
    });
  }, 10000);

  renderTasks();
});
