document.addEventListener('DOMContentLoaded', function () {
    const dateInput = document.getElementById('task-date');
    dateInput.value = getToday();
    loadTasksForDate(dateInput.value);
  
    dateInput.addEventListener('change', () => {
      loadTasksForDate(dateInput.value);
      resetAddButton();
    });
  
    document.getElementById('prev-date').addEventListener('click', () => {
      const currentDate = new Date(dateInput.value);
      currentDate.setDate(currentDate.getDate() - 1);
      dateInput.value = currentDate.toISOString().split('T')[0];
      loadTasksForDate(dateInput.value);
      resetAddButton();
    });
  
    document.getElementById('next-date').addEventListener('click', () => {
      const currentDate = new Date(dateInput.value);
      currentDate.setDate(currentDate.getDate() + 1);
      dateInput.value = currentDate.toISOString().split('T')[0];
      loadTasksForDate(dateInput.value);
      resetAddButton();
    });
  
    resetAddButton();
  });
  
  function getToday() {
    return new Date().toISOString().split('T')[0];
  }
  
  function loadTasksForDate(date) {
    chrome.storage.local.get({ tasksByDate: {} }, (data) => {
      const allTasks = data.tasksByDate || {};
      const tasks = allTasks[date] || [];
  
      const todoList = document.getElementById('task-list');
      const completedList = document.getElementById('completed-list');
      const todoSection = document.getElementById('todo-section');
      const completedSection = document.getElementById('completed-section');
  
      todoList.innerHTML = '';
      completedList.innerHTML = '';
  
      let hasTodo = false;
      let hasCompleted = false;
  
      tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item py-1 px-2 d-flex justify-content-between align-items-center';
  
        if (task.done) {
          hasCompleted = true;
  
          const wrapper = document.createElement('div');
          wrapper.className = 'form-check d-flex align-items-center';
  
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = true;
          checkbox.className = 'form-check-input me-2';
          checkbox.onchange = () => toggleTask(index);
  
          const label = document.createElement('label');
          label.className = 'form-check-label text-muted flex-grow-1';
          label.textContent = task.text;
  
          wrapper.append(checkbox, label);
          li.appendChild(wrapper);
          completedList.appendChild(li);
        } else {
          hasTodo = true;
          li.textContent = task.text;
  
          const tickBtn = document.createElement('button');
          tickBtn.className = 'btn btn-sm btn-info me-1';
          tickBtn.textContent = '✓';
          tickBtn.onclick = () => toggleTask(index);
  
          const editBtn = document.createElement('button');
          editBtn.className = 'btn btn-sm btn-warning me-1';
          editBtn.textContent = '✎';
          editBtn.onclick = () => editTask(index, task.text);
  
          const delBtn = document.createElement('button');
          delBtn.className = 'btn btn-sm btn-danger';
          delBtn.textContent = '✕';
          delBtn.onclick = () => deleteTask(index);
  
          const btnGroup = document.createElement('div');
          btnGroup.className = 'btn-group btn-group-sm';
          btnGroup.append(editBtn, tickBtn, delBtn);
  
          li.appendChild(btnGroup);
          todoList.appendChild(li);
        }
      });
  
      todoSection.style.display = hasTodo ? 'block' : 'none';
      completedSection.style.display = hasCompleted ? 'block' : 'none';
    });
  }
  
  function resetAddButton() {
    const addBtn = document.getElementById('add-task');
    addBtn.textContent = 'Add';
    addBtn.className = 'btn btn-primary';
  
    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);
  
    newBtn.addEventListener('click', () => {
      const input = document.getElementById('task-input');
      const task = input.value.trim();
      const date = document.getElementById('task-date').value;
  
      if (task) {
        chrome.storage.local.get({ tasksByDate: {} }, (data) => {
          const tasksByDate = data.tasksByDate || {};
          if (!tasksByDate[date]) tasksByDate[date] = [];
          tasksByDate[date].push({ text: task, done: false });
  
          chrome.storage.local.set({ tasksByDate }, () => {
            input.value = '';
            loadTasksForDate(date);
          });
        });
      }
    });
  }
  
  function deleteTask(index) {
    const date = document.getElementById('task-date').value;
    chrome.storage.local.get({ tasksByDate: {} }, (data) => {
      const tasksByDate = data.tasksByDate || {};
      tasksByDate[date].splice(index, 1);
      chrome.storage.local.set({ tasksByDate }, () => loadTasksForDate(date));
    });
  }
  
  function editTask(index, oldTask) {
    const input = document.getElementById('task-input');
    input.value = oldTask;
    input.focus();
  
    const addBtn = document.getElementById('add-task');
    addBtn.textContent = 'Save';
    addBtn.className = 'btn btn-success';
  
    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);
  
    newBtn.addEventListener('click', () => {
      const newTask = input.value.trim();
      const date = document.getElementById('task-date').value;
      if (newTask) {
        chrome.storage.local.get({ tasksByDate: {} }, (data) => {
          const tasksByDate = data.tasksByDate || {};
          tasksByDate[date][index].text = newTask;
          chrome.storage.local.set({ tasksByDate }, () => {
            input.value = '';
            loadTasksForDate(date);
            resetAddButton();
          });
        });
      }
    });
  }
  
  function toggleTask(index) {
    const date = document.getElementById('task-date').value;
    chrome.storage.local.get({ tasksByDate: {} }, (data) => {
      const tasksByDate = data.tasksByDate || {};
      tasksByDate[date][index].done = !tasksByDate[date][index].done;
      chrome.storage.local.set({ tasksByDate }, () => loadTasksForDate(date));
    });
  }
  