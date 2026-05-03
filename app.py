import os
from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from datetime import date

app = Flask(__name__)

# ===== DATABASE CONFIG (SQLite) =====
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///task_manager.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ===== MODELS =====
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    role = db.Column(db.String(20))

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    description = db.Column(db.Text)
    assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'))
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'))
    status = db.Column(db.String(20))
    due_date = db.Column(db.Date)

# ===== CREATE DATABASE =====
with app.app_context():
    db.create_all()

# ===== HOME =====
@app.route('/')
def home():
    return render_template('index.html')

# ===== SIGNUP =====
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email already registered"})

    user = User(
        name=data['name'],
        email=data['email'],
        password=data['password'],
        role=data['role']
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"})

# ===== LOGIN =====
@app.route('/login', methods=['POST'])
def login():
    data = request.json

    user = User.query.filter_by(
        email=data['email'],
        password=data['password']
    ).first()

    if user:
        return jsonify({
            "message": "Login successful",
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        })
    else:
        return jsonify({"message": "Invalid credentials"})

# ===== GET USERS =====
@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify({
        "users": [{"id": u.id, "name": u.name, "role": u.role} for u in users]
    })

# ===== CREATE PROJECT =====
@app.route('/create_project', methods=['POST'])
def create_project():
    data = request.json

    project = Project(
        name=data['name'],
        created_by=data['created_by']
    )
    db.session.add(project)
    db.session.commit()

    return jsonify({"message": "Project created", "project_id": project.id})

# ===== GET PROJECTS =====
@app.route('/projects', methods=['GET'])
def get_projects():
    projects = Project.query.all()

    result = []
    for p in projects:
        user = User.query.get(p.created_by)
        result.append({
            "id": p.id,
            "name": p.name,
            "created_by": p.created_by,
            "creator_name": user.name if user else ""
        })

    return jsonify({"projects": result})

# ===== CREATE TASK =====
@app.route('/create_task', methods=['POST'])
def create_task():
    data = request.json

    task = Task(
        title=data['title'],
        description=data.get('description', ''),
        assigned_to=data['assigned_to'],
        project_id=data.get('project_id', 1),
        status=data['status'],
        due_date=date.fromisoformat(data['due_date'])
    )

    db.session.add(task)
    db.session.commit()

    return jsonify({"message": "Task created"})

# ===== GET TASKS =====
@app.route('/tasks', methods=['GET'])
def get_tasks():
    user_id = request.args.get('user_id')
    
    if user_id:
        tasks = Task.query.filter_by(assigned_to=user_id).all()
    else:
        tasks = Task.query.all()

    result = []
    for t in tasks:
        user = User.query.get(t.assigned_to)
        project = Project.query.get(t.project_id)

        result.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "assigned_to": t.assigned_to,
            "project_id": t.project_id,
            "status": t.status,
            "due_date": str(t.due_date) if t.due_date else None,
            "assigned_name": user.name if user else "",
            "project_name": project.name if project else ""
        })

    return jsonify({"tasks": result})

# ===== UPDATE TASK =====
@app.route('/update_task/<int:id>', methods=['PUT'])
def update_task(id):
    data = request.json
    task = Task.query.get(id)

    if task:
        task.status = data['status']
        db.session.commit()
        return jsonify({"message": "Task updated"})
    else:
        return jsonify({"message": "Task not found"})

# ===== DASHBOARD =====
@app.route('/dashboard', methods=['GET'])
def dashboard():
    total = Task.query.count()
    completed = Task.query.filter_by(status='Completed').count()
    pending = Task.query.filter_by(status='Pending').count()

    overdue = Task.query.filter(
        Task.due_date < date.today(),
        Task.status != 'Completed'
    ).count()

    return jsonify({
        "total_tasks": total,
        "completed_tasks": completed,
        "pending_tasks": pending,
        "overdue_tasks": overdue
    })

# ===== FRONTEND ROUTE =====
@app.route('/ui')
def ui():
    return render_template('index.html')

# ===== RUN =====
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))