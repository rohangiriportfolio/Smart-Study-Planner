document.addEventListener('DOMContentLoaded', () => {

    const storageKey = 'smartStudyTasks';
        let tasks = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
        function saveTasks() {
          localStorage.setItem(storageKey, JSON.stringify(tasks));
        }
    
        function renderTasks() {
          const taskList = document.getElementById('task-list');
          taskList.innerHTML = '';
    
          if (tasks.length === 0) {
            taskList.innerHTML = '<p style="color:#999; text-align:center; padding:20px; margin-bottom: 0px">No study tasks added yet.</p>';
            return;
          }
    
          tasks.forEach((task, idx) => {
            const div = document.createElement('div');
            div.className = 'task-row' + (task.done ? ' done' : '');
            div.innerHTML = `
              <div class="task-info">
                <span class="task-subject">📘 ${task.subject} - ${task.topic}</span>
                <span class="task-meta" style="margin-left: 4px">📅 ${task.date} | ${task.time}</span>
              </div>
              <div class="task-actions">
                <button onclick="toggleDone(${idx})" title="${task.done ? 'Mark as Pending' : 'Mark as Completed'}" class="${task.done ? 'undo-btn' : 'check-btn'}">
                  <i class="material-icons">${task.done ? 'undo' : 'check_circle'}</i>
                </button>
                <button onclick="deleteTask(${idx})" title="Delete Task" class="delete-btn">
                  <i class="material-icons">delete</i>
                </button>
              </div>
            `;
            taskList.appendChild(div);
          });
        }
    
        function toggleDone(index) {
          tasks[index].done = !tasks[index].done;
          saveTasks();
          renderTasks();
        }
    
        function deleteTask(index) {
          tasks.splice(index, 1);
          saveTasks();
          renderTasks();
        }
    
        // Request permission with proper promise handling and triggered on form submit click
        document.getElementById('task-form').addEventListener('submit', function (e) {
          e.preventDefault();
    
          // Request permission if not already granted
          if ('Notification' in window) {
            if (Notification.permission === 'granted') {
              addTask(); // Permission granted, add task without asking
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                  addTask();
                } else {
                  alert('Please allow notifications to get reminders.');
                  addTask();
                }
              });
            } else {
              alert('Please allow notifications to get reminders.');
              addTask();
            }
          } else {
            alert('Your browser does not support notifications.');
            addTask();
          }
    
        });
    
        function addTask() {
          const subject = document.getElementById('subject').value.trim();
          const topic = document.getElementById('topic').value.trim();
          const date = document.getElementById('task-date').value;
          const time = document.getElementById('task-time').value;
    
          if (subject && topic && date && time) {
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
            document.getElementById('task-form').reset();
            const inputs = document.querySelectorAll('.mdl-textfield');
            inputs.forEach(container => container.classList.remove('is-dirty'));
          }
        }
    
        function checkUpcomingTasks() {
          if (Notification.permission !== 'granted') return;
    
          const now = new Date();
    
          tasks.forEach((task, idx) => {
            if (task.done) return; // Skip completed tasks
            if (task.notified) return; // Skip already notified
    
            const taskDateTime = new Date(`${task.date}T${task.time}:00`);
    
            // Calculate the difference in milliseconds
            const diff = taskDateTime - now;
    
            // Notify if exactly 1 minute (±5 seconds) before task
            if (diff > 55000 && diff < 65000) {
              new Notification('Upcoming Study Task', {
                body: `${task.subject} - ${task.topic} is scheduled in 1 minute.`,
                icon: 'book.png' // Optional: add icon URL here
              });
    
              // Mark task as notified and save
              tasks[idx].notified = true;
              saveTasks();
            }
          });
        }
    
        // Check every 10 seconds
        setInterval(checkUpcomingTasks, 2000);
    
        renderTasks();
        window.toggleDone = toggleDone;
        window.deleteTask = deleteTask;
});
