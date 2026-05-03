# Team Task Manager

A simple web-based task management application built with Python (Flask) and SQLite. It allows a team to sign up, create projects, assign tasks, and track progress through a dashboard.

---

## Description

Team Task Manager is a full-stack web application where an **Admin** can create projects, assign tasks to team members, and monitor progress. **Members** can log in and view the tasks assigned to them. The app is designed to be lightweight, easy to run locally, and suitable as a college-level project.

---

## Features

- **Signup & Login** — Users can register with a name, email, password, and role (Admin or Member)
- **Role-Based Access** — Admins see all features; Members only see their own tasks
- **Create Project** — Admins can create and manage projects
- **Create Task** — Admins can assign tasks to team members with a due date and status
- **View Tasks** — Members see tasks assigned to them; Admins see all tasks across the team
- **Dashboard** — Shows a summary of total, completed, pending, and overdue tasks

---

## Technologies Used

| Layer | Technology |
|-------|-----------|
| Backend | Python 3, Flask, Flask-SQLAlchemy |
| Database | SQLite (auto-created on first run) |
| Frontend | HTML, CSS, JavaScript (Vanilla) |

---

## Project Structure

```
team-task-manager/
│
├── app.py                  # Main Flask application and API routes
│
├── templates/
│   └── index.html          # Single-page frontend (3 views: Auth, Workspace, Dashboard)
│
├── static/
│   ├── style.css           # All styling
│   └── script.js           # Frontend logic and API calls
│
├── instance/
│   └── task_manager.db     # SQLite database (auto-generated)
│
└── README.md
```

---

## Installation & Setup

Follow these steps to run the project on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/team-task-manager.git
cd team-task-manager
```

### 2. Install Dependencies

Make sure Python 3 is installed. Then run:

```bash
pip install flask flask-sqlalchemy
```

### 3. Run the Application

```bash
python app.py
```

### 4. Open in Browser

```
http://localhost:5000
```

The SQLite database (`task_manager.db`) is created automatically on first run. No extra database setup is needed.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/signup` | Register a new user |
| `POST` | `/login` | Login and get user info |
| `GET` | `/users` | Get list of all users |
| `POST` | `/create_project` | Create a new project |
| `GET` | `/projects` | Get all projects |
| `POST` | `/create_task` | Create and assign a task |
| `GET` | `/tasks` | Get all tasks (or filter by `?user_id=`) |
| `PUT` | `/update_task/<id>` | Update task status |
| `GET` | `/dashboard` | Get task summary counts |

### Example — Login Request

```json
POST /login
{
  "email": "admin@example.com",
  "password": "yourpassword"
}
```

### Example — Login Response

```json
{
  "message": "Login successful",
  "user_id": 1,
  "name": "Jane Doe",
  "role": "Admin"
}
```

---

## Database

The app uses SQLite with three tables, created automatically by SQLAlchemy.

### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| name | String | Full name |
| email | String | Unique email address |
| password | String | Plain-text password |
| role | String | `Admin` or `Member` |

### `projects`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| name | String | Project name |
| created_by | Integer | Foreign key → `users.id` |

### `tasks`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| title | String | Task title |
| description | Text | Task details |
| assigned_to | Integer | Foreign key → `users.id` |
| project_id | Integer | Foreign key → `projects.id` |
| status | String | `Pending`, `In Progress`, or `Completed` |
| due_date | Date | Task deadline |

---

## How to Use

1. **Sign Up** — Open the app and create an account. Select `Admin` if you are the project manager, or `Member` if you are a team member.

2. **Sign In** — Log in with your email and password. The app will show different features based on your role.

3. **Create a Project** *(Admin only)* — Go to the Projects tab and enter a project name to create one.

4. **Create a Task** *(Admin only)* — Go to the Create Task tab. Fill in the title, description, assign it to a team member, select a project, set a due date, and click Create Task.

5. **View My Tasks** *(Members)* — Members land directly on the My Tasks page and can see all tasks assigned to them, along with their status and due dates.

6. **Dashboard** *(Admin only)* — Click Dashboard to see a summary of total, completed, pending, and overdue tasks across the entire team.

---

## Future Improvements

- Add proper session-based or token-based authentication (JWT)
- Allow Members to update their own task status
- Add email notifications for upcoming or overdue tasks
- Improve the UI with charts and progress graphs on the dashboard
- Deploy the application online using platforms like Render or Railway
- Add a search and filter option for tasks and projects

---

## Author

**Your Name**
College Name | Department | Year

> Submitted as part of a college project on full-stack web development.
