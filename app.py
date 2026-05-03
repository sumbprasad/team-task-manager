import os
from flask import Flask, request, jsonify, render_template
from flask_mysqldb import MySQL

app = Flask(__name__)

# MySQL Config
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'prasad@1234'
app.config['MYSQL_DB'] = 'task_manager'

mysql = MySQL(app)

# Home Route
@app.route('/')
def home():
    return "Server Running"

# Signup API
@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        name = data['name']
        email = data['email']
        password = data['password']
        role = data['role']

        cur = mysql.connection.cursor()

        cur.execute("SELECT * FROM users WHERE email=%s", (email,))
        existing_user = cur.fetchone()

        if existing_user:
            return {"message": "Email already registered"}

        cur.execute("INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)",
                    (name, email, password, role))
        mysql.connection.commit()
        cur.close()

        return {"message": "User registered successfully"}

    except Exception as e:
        return {"error": str(e)}

# Login API
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data['email']
    password = data['password']

    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users WHERE email=%s AND password=%s", (email, password))
    user = cur.fetchone()
    cur.close()

    if user:
        return jsonify({"message": "Login successful"})
    else:
        return jsonify({"message": "Invalid credentials"})

# ✅ CREATE PROJECT 
@app.route('/create_project', methods=['POST'])
def create_project():
    data = request.json
    name = data['name']
    created_by = data['created_by']

    cur = mysql.connection.cursor()
    cur.execute("INSERT INTO projects (name, created_by) VALUES (%s, %s)",
                (name, created_by))
    mysql.connection.commit()
    cur.close()

    return {"message": "Project created"}

# CREATE TASK
@app.route('/create_task', methods=['POST'])
def create_task():
    data = request.json
    title = data['title']
    description = data['description']
    assigned_to = data['assigned_to']
    project_id = data['project_id']
    status = data['status']
    due_date = data['due_date']

    cur = mysql.connection.cursor()
    cur.execute("""INSERT INTO tasks 
        (title, description, assigned_to, project_id, status, due_date)
        VALUES (%s, %s, %s, %s, %s, %s)""",
        (title, description, assigned_to, project_id, status, due_date))
    
    mysql.connection.commit()
    cur.close()

    return {"message": "Task created"}

# GET TASKS
@app.route('/tasks', methods=['GET'])
def get_tasks():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM tasks")
    tasks = cur.fetchall()
    cur.close()

    return {"tasks": tasks}

# UPDATE TASK
@app.route('/update_task/<int:id>', methods=['PUT'])
def update_task(id):
    data = request.json
    status = data['status']

    cur = mysql.connection.cursor()
    cur.execute("UPDATE tasks SET status=%s WHERE id=%s", (status, id))
    mysql.connection.commit()
    cur.close()

    return {"message": "Task updated"}
#create a dashboard api
@app.route('/dashboard', methods=['GET'])
def dashboard():
    cur = mysql.connection.cursor()

    # Total tasks
    cur.execute("SELECT COUNT(*) FROM tasks")
    total = cur.fetchone()[0]

    # Completed tasks
    cur.execute("SELECT COUNT(*) FROM tasks WHERE status='Completed'")
    completed = cur.fetchone()[0]

    # Pending tasks
    cur.execute("SELECT COUNT(*) FROM tasks WHERE status='Pending'")
    pending = cur.fetchone()[0]

    # Overdue tasks
    cur.execute("""
        SELECT COUNT(*) FROM tasks 
        WHERE due_date < CURDATE() AND status != 'Completed'
    """)
    overdue = cur.fetchone()[0]

    cur.close()

    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "pending_tasks": pending,
        "overdue_tasks": overdue
    }


#Connect Flask to Frontend
@app.route('/ui')
def ui():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))