const todoList = document.getElementById("list");
const remainingText = document.getElementById("remaining-task");
const addButton = document.getElementById("add-btn");

let todos = [];

// Fetch todos from the backend API when the page loads
window.onload = function() {
  fetchTodos();
};

// Function to fetch todos from the backend API
function fetchTodos() {
  fetch('https://todo-api-wgkw.onrender.com/api/todos')  // Updated API URL for Render
    .then(response => response.json())
    .then(data => {
      todos = data;
      updateUI();
    })
    .catch(error => console.error('Error fetching todos:', error));
}

// Function to update the UI based on the todos array
function updateUI() {
  todoList.innerHTML = "";
  remainingText.textContent = todos.filter(todo => !todo.checked).length;

  todos.forEach(todo => {
    const li = document.createElement("li");
    li.classList.toggle("checked", todo.checked);
    li.innerHTML = `
      <div id="item-ct">
        <div class="topic" id="topic-ct">
          <span>${todo.title}</span>
          <i class="fa-solid ${todo.dropdown ? "fa-circle-chevron-up" : "fa-circle-chevron-down"}" type="button" onclick="toggleDropdown('${todo.id}')"></i>
        </div>
      </div>
      <div id="dropdown-ct-${todo.id}" ${todo.dropdown ? "" : "hidden"}>
        <div class="drpbtn">
          <span>${todo.date}</span>
          <span>${todo.time}</span>
          <div>
            <i class="fa-solid fa-edit" type="button" onclick="editItem('${todo.id}')"></i>
            <i class="fa-solid fa-check-circle" onclick="checkItem('${todo.id}')"></i>
            <i class="fa-solid fa-trash" onclick="deleteItem('${todo.id}')"></i>
          </div>
        </div>
      </div>
    `;
    todoList.appendChild(li);
  });
}

// Toggle dropdown visibility for each todo item
function toggleDropdown(id) {
  todos = todos.map(todo => {
    if (todo.id === id) {
      return { ...todo, dropdown: !todo.dropdown };
    }
    return todo;
  });
  updateUI();
}

// Delete a todo item via API
function deleteItem(id) {
  fetch(`https://todo-api-wgkw.onrender.com/api/todos/${id}`, {  // Updated API URL for Render
    method: 'DELETE',
  })
    .then(() => {
      todos = todos.filter(todo => todo.id !== id);
      updateUI();
    })
    .catch(error => console.error('Error deleting todo:', error));
}

// Mark a todo item as checked (completed) via API
function checkItem(id) {
  const todo = todos.find(todo => todo.id === id);
  const updatedTodo = { ...todo, checked: true };

  fetch(`https://todo-api-wgkw.onrender.com/api/todos/${id}`, {  // Updated API URL for Render
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedTodo),
  })
    .then(response => response.json())
    .then(() => {
      todo.checked = true;
      updateUI();
    })
    .catch(error => console.error('Error updating todo:', error));
}

// Handle the "Add Todo" button click event
function onAddButtonClicked() {
  const titleInput = document.getElementById("topic");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");

  const newTodo = {
    title: titleInput.value,
    date: dateInput.value,
    time: timeInput.value,
    checked: false,
    dropdown: false,
  };

  fetch('https://todo-api-wgkw.onrender.com/api/todos', {  // Updated API URL for Render
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newTodo),
  })
    .then(response => response.json())
    .then(data => {
      todos.push(data); // Assuming the backend returns the newly created todo
      updateUI();
    })
    .catch(error => console.error('Error adding todo:', error));

  titleInput.value = "";
  dateInput.value = "";
  timeInput.value = "";
}

// Clear all todos (Optional feature)
function clearAll() {
  fetch('https://todo-api-wgkw.onrender.com/api/todos', {  // Updated API URL for Render
    method: 'DELETE',  // This will delete all todos from the database
  })
    .then(() => {
      todos = [];
      updateUI();
    })
    .catch(error => console.error('Error clearing todos:', error));
}

// Edit a todo item via API
function editItem(id) {
  const todo = todos.find(todo => todo.id === id);
  const newTitle = prompt("Enter new title", todo.title);
  const newDate = prompt("Enter new date", todo.date);
  const newTime = prompt("Enter new time", todo.time);

  if (newTitle !== null) {
    const updatedTodo = { ...todo, title: newTitle, date: newDate, time: newTime };

    fetch(`https://todo-api-wgkw.onrender.com/api/todos/${id}`, {  // Updated API URL for Render
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedTodo),
    })
      .then(response => response.json())
      .then(data => {
        const index = todos.findIndex(todo => todo.id === id);
        todos[index] = data; // Update todo in local state
        updateUI();
      })
      .catch(error => console.error('Error editing todo:', error));
  }
}

// Event listener for the "Add" button
addButton.addEventListener("click", onAddButtonClicked);
