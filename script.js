

const todoList = document.getElementById("list");
const remainingText = document.getElementById("remaining-task");
const addButton = document.getElementById("add-btn");

let todos = [];
const userId= "user-id"

// Backend API base URL
const API_URL = "https://todo-api-wgkw.onrender.com/api/todos";

window.onload = function () {
  fetchTodos();
};


// Function to fetch todos from the backend API
async function fetchTodos() {
  try {
    const response = await fetch(`${API_URL}/${userId}`);
    if (!response.ok) throw new Error(`Error fetching todos: ${response.statusText}`);
    todos = await response.json();
    updateUI();
  } catch (error) {
    console.error(error);
  }
}


async function updateUI() {
  todoList.innerHTML = "";
  getRemainingTodos();

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
      </div>
    `;
    todoList.appendChild(li);
  });


}



function toggleDropdown(id) {
    
    todos = todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, dropdown: !todo.dropdown };
      }
      return todo;
    });
    updateUI();

  }




async function deleteItem(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error(`Error deleting todo: ${response.statusText}`);
    todos = todos.filter(todo => todo.id !== id);
    updateUI();
  } catch (error) {
    console.error(error);
  }
}



// Mark a todo item as checked (completed) via API
async function checkItem(id) {
  try {
    const todo = todos.find(todo => todo.id === id);
    const updatedTodo = { ...todo, checked: true };

    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTodo),
    });

    if (!response.ok) throw new Error(`Error updating todo: ${response.statusText}`);
    
    todos = todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, checked: true };
      }
      return todo;
    });
    updateUI();

  } catch (error) {
    console.error(error);
  }
}

function generateObjectId() {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16); // 4-byte timestamp
  const random = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join(""); // 12-byte random hex
  return timestamp + random;
}

async function onAddButtonClicked() {
  const titleInput = document.getElementById("topic");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");


  const newTodo = {
    id: generateObjectId(), // Generate a universally unique ID
    title: titleInput.value,
    date: dateInput.value,
    time: timeInput.value,
    dropdown: false,
    checked: false,
    userId: "user-id",
  };
  
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTodo),
    });

    if (!response.ok) throw new Error(`Error adding todo: ${response.statusText}`);
    const data = await response.json();
    console.log("Backend response:", data);
    todos.push(data); // Assuming the backend returns the newly created todo
    updateUI();

    // Clear input fields
    titleInput.value = "";
    dateInput.value = "";
    timeInput.value = "";
  } catch (error) {
    console.error(error);
  }
}


async function clearAll() {
  try {
    // Send a DELETE request to the backend to clear all todos
    const response = await fetch(`${API_URL}/deleteAll/${userId}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error(`Failed to clear todos: ${response.statusText}`);

    // Clear the local todos array
    todos = [];

    // Update the UI
    updateUI();

    console.log("All todos cleared successfully.");
  } catch (error) {
    console.error("Error clearing todos:", error);
    alert("Failed to clear todos. Please try again.");
  }
}


addButton.addEventListener("click", onAddButtonClicked);


// Edit a todo item via API
async function editItem(id) {
  const todo = todos.find(todo => todo.id === id);
  const newTitle = prompt("Enter new title", todo.title);
  const newDate = prompt("Enter new date", todo.date);
  const newTime = prompt("Enter new time", todo.time);

  if (newTitle !== null) {
    const updatedTodo = { ...todo, title: newTitle, date: newDate, time: newTime };

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTodo),
      });

      if (!response.ok) throw new Error(`Error editing todo: ${response.statusText}`);
      todos = todos.map(todo => (todo.id === id ? updatedTodo : todo));
      updateUI();
    } catch (error) {
      console.error(error);
    }
  }
}
async function getRemainingTodos() {
  try {
    // Replace "user-id" with the actual user ID dynamically
    const userId = "user-id"; // Replace this with the current user ID
    const response = await fetch(`${API_URL}/remaining/${userId}`, {
      method: "GET",
    });

    if (!response.ok) throw new Error(`Failed to fetch remaining todos: ${response.statusText}`);

    const data = await response.json();
    // Assuming you have an element with id 'remainingText' in your HTML
    remainingText.textContent = data.remaining; // Update the text content with the remaining count

    console.log(`Remaining todos: ${data.remaining}`);
  } catch (error) {
    console.error("Error fetching remaining todos:", error);
  }
}



