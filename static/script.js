const BASE_URL = "";

// Signup
function signup() {
    fetch(BASE_URL + "/signup", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            role: document.getElementById("role").value
        })
    })
    .then(res => res.json())
    .then(data => alert(data.message));
}

// Login
function login() {
    fetch(BASE_URL + "/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            email: document.getElementById("login_email").value,
            password: document.getElementById("login_password").value
        })
    })
    .then(res => res.json())
    .then(data => alert(data.message));
}

// Create Project
function createProject() {
    fetch("/create_project", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: document.getElementById("project_name").value,
            created_by: document.getElementById("created_by").value
        })
    })
    .then(res => res.json())
    .then(data => alert(data.message))
    .catch(err => console.log("Error:", err));
}

// Create Task
function createTask() {
    fetch("/create_task", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            title: document.getElementById("title").value,
            description: document.getElementById("description").value,
            assigned_to: document.getElementById("assigned_to").value,
            project_id: document.getElementById("project_id").value,
            status: document.getElementById("status").value,
            due_date: document.getElementById("due_date").value
        })
    })
    .then(res => res.json())
    .then(data => alert(data.message))
    .catch(err => console.log(err));
}

// Load Dashboard 
function getDashboard() {
    fetch("/dashboard")
    .then(res => res.json())
    .then(data => {
        document.getElementById("dashboard").innerText =
            "Total: " + data.total_tasks +
            ", Completed: " + data.completed_tasks +
            ", Pending: " + data.pending_tasks +
            ", Overdue: " + data.overdue_tasks;
    })
    .catch(err => console.log(err));
}
