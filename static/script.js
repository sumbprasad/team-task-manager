const BASE_URL = "";

// Current logged-in user info
let currentUser = null; // { id, name, email, role }

// ===== PAGE NAVIGATION =====
function goTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if (pageId === 'page-dashboard') loadDashboard();
}

// ===== TAB SWITCHING (Auth page) =====
function switchTab(tab) {
    const slider = document.getElementById('tab-slider');
    const btns = document.querySelectorAll('.tab-btn');

    if (tab === 'login') {
        slider.classList.remove('right');
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
        document.getElementById('form-login').classList.remove('hidden');
        document.getElementById('form-signup').classList.add('hidden');
    } else {
        slider.classList.add('right');
        btns[1].classList.add('active');
        btns[0].classList.remove('active');
        document.getElementById('form-signup').classList.remove('hidden');
        document.getElementById('form-login').classList.add('hidden');
    }
}

// ===== SECTION SWITCHING (Workspace page) =====
function showSection(id) {
    document.querySelectorAll('.ws-section').forEach(s => s.classList.remove('active'));
    document.getElementById('section-' + id).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    if (id === 'my-tasks') loadMyTasks();
    if (id === 'all-tasks') loadAllTasks();
}

// ===== SHOW MESSAGE =====
function showMsg(id, text, isError = false) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className = 'msg' + (isError ? ' error' : '');
    setTimeout(() => el.textContent = '', 4000);
}

// ===== ROLE-BASED UI =====
function applyRoleUI(role) {
    const isAdmin = role === 'Admin';
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = isAdmin ? '' : 'none';
    });

    // Default section for members = my-tasks
    if (isAdmin) {
        loadProjectCards();
    }
    if (!isAdmin) {
        document.querySelectorAll('.ws-section').forEach(s => s.classList.remove('active'));
        document.getElementById('section-my-tasks').classList.add('active');
        // Set My Tasks nav btn active
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        const myTasksBtn = document.querySelector('.nav-btn:not(.admin-only):not(.logout-btn)');
        if (myTasksBtn) myTasksBtn.classList.add('active');
        loadMyTasks();
    } else {
        // Populate dropdowns for task creation
        loadMembers();
        loadProjects();
    }
}

// ===== LOGOUT =====
function logout() {
    currentUser = null;
    goTo('page-auth');
    switchTab('login');
    document.getElementById('login_email').value = '';
    document.getElementById('login_password').value = '';
}

// ===== SIGNUP =====
function signup() {
    const name     = document.getElementById("name").value.trim();
    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const role     = document.getElementById("role").value;

    if (!name || !email || !password || !role) {
        showMsg('signup-msg', 'Please fill in all fields.', true);
        return;
    }

    fetch(BASE_URL + "/signup", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name, email, password, role })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message === "User registered successfully") {
            showMsg('signup-msg', '✓ Account created! You can now sign in.');
            setTimeout(() => switchTab('login'), 1800);
        } else {
            showMsg('signup-msg', data.message || data.error, true);
        }
    })
    .catch(() => showMsg('signup-msg', 'Connection error.', true));
}

// ===== LOGIN =====
function login() {
    const email    = document.getElementById("login_email").value.trim();
    const password = document.getElementById("login_password").value;

    if (!email || !password) {
        showMsg('login-msg', 'Please enter your email and password.', true);
        return;
    }

    fetch(BASE_URL + "/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message === "Login successful") {
            currentUser = {
                id: data.user_id,
                name: data.name,
                email: data.email,
                role: data.role
            };
            showMsg('login-msg', '✓ Signed in!');
            setTimeout(() => {
                goTo('page-workspace');
                applyRoleUI(currentUser.role);
            }, 800);
        } else {
            showMsg('login-msg', data.message, true);
        }
    })
    .catch(() => showMsg('login-msg', 'Connection error.', true));
}

// ===== LOAD PROJECTS (for task project dropdown) =====
function loadProjects() {
    fetch(BASE_URL + "/projects")
    .then(res => res.json())
    .then(data => {
        const sel = document.getElementById('project_id_select');
        sel.innerHTML = '<option value="">Select project</option>';
        (data.projects || []).forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `#${p.id} — ${p.name}`;
            sel.appendChild(opt);
        });
    })
    .catch(() => {});
}

// ===== LOAD PROJECT CARDS =====
function loadProjectCards() {
    fetch(BASE_URL + "/projects")
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById('project-cards');
        if (!container) return;
        const projects = data.projects || [];
        if (!projects.length) {
            container.innerHTML = '<div class="loading-state">No projects yet. Create one above.</div>';
            return;
        }
        container.innerHTML = projects.map(p => `
            <div class="task-card project-card">
                <div class="task-top">
                    <span class="task-title">${p.name}</span>
                    <span class="task-status status-wip id-pill">#${p.id}</span>
                </div>
                <div class="task-meta">
                    <span class="meta-item">Created by: ${p.creator_name || 'User #' + p.created_by}</span>
                </div>
            </div>
        `).join('');
    })
    .catch(() => {});
}

// ===== LOAD MEMBERS (for task assignment dropdown) =====
function loadMembers() {
    fetch(BASE_URL + "/users")
    .then(res => res.json())
    .then(data => {
        const sel = document.getElementById('assigned_to_select');
        sel.innerHTML = '<option value="">Select member</option>';
        (data.users || []).forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.id;
            opt.textContent = `${u.name} (${u.role})`;
            sel.appendChild(opt);
        });
    })
    .catch(() => {});
}

// ===== CREATE PROJECT =====
function createProject() {
    const name = document.getElementById("project_name").value.trim();

    if (!name) {
        showMsg('project-msg', 'Please enter a project name.', true);
        return;
    }

    fetch(BASE_URL + "/create_project", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name, created_by: currentUser ? currentUser.id : 1 })
    })
    .then(res => res.json())
    .then(data => {
        showMsg('project-msg', '✓ ' + (data.message || 'Project created!') + (data.project_id ? ' (ID: ' + data.project_id + ')' : ''));
        document.getElementById("project_name").value = '';
        loadProjectCards();
        loadProjects();
    })
    .catch(() => showMsg('project-msg', 'Connection error.', true));
}

// ===== CREATE TASK =====
function createTask() {
    const title       = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const assigned_to = document.getElementById("assigned_to_select").value;
    const project_id  = document.getElementById("project_id_select").value;
    const status      = document.getElementById("status").value;
    const due_date    = document.getElementById("due_date").value;

    if (!title || !assigned_to || !project_id || !due_date) {
        showMsg('task-msg', 'Please fill in all required fields.', true);
        return;
    }

    fetch(BASE_URL + "/create_task", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ title, description, assigned_to, project_id, status, due_date })
    })
    .then(res => res.json())
    .then(data => {
        showMsg('task-msg', '✓ ' + (data.message || 'Task created!'));
        document.getElementById("title").value = '';
        document.getElementById("description").value = '';
        document.getElementById("assigned_to_select").value = '';
        document.getElementById("project_id_select").value = '';
        document.getElementById("due_date").value = '';
    })
    .catch(() => showMsg('task-msg', 'Connection error.', true));
}

// ===== TASK CARD RENDERER =====
function renderTaskCard(task) {
    const statusClass = {
        'Completed': 'status-done',
        'In Progress': 'status-wip',
        'Pending': 'status-pending'
    }[task.status] || 'status-pending';

    const overdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Completed';

    return `
    <div class="task-card ${overdue ? 'overdue' : ''}">
        <div class="task-top">
            <span class="task-title">${task.title}</span>
            <span class="task-status ${statusClass}">${task.status}</span>
        </div>
        ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
        <div class="task-meta">
            <span class="meta-item assigned-to">👤 ${task.assigned_name || ('User #' + task.assigned_to)}</span>
            <span class="meta-item project-tag">📁 ${task.project_name || 'Unknown'} <span class="id-badge">#${task.project_id}</span></span>
            <span class="meta-item due ${overdue ? 'overdue-label' : ''}">📅 ${task.due_date ? task.due_date : 'No date'}</span>
        </div>
    </div>`;
}

// ===== LOAD MY TASKS =====
function loadMyTasks() {
    const container = document.getElementById('my-tasks-list');
    container.innerHTML = '<div class="loading-state">Loading…</div>';

    const userId = currentUser ? currentUser.id : null;
    if (!userId) { container.innerHTML = '<div class="loading-state">Not logged in.</div>'; return; }

    fetch(BASE_URL + `/tasks?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        const tasks = data.tasks || [];
        if (!tasks.length) {
            container.innerHTML = '<div class="loading-state">No tasks assigned to you yet.</div>';
            return;
        }
        container.innerHTML = tasks.map(renderTaskCard).join('');
    })
    .catch(() => { container.innerHTML = '<div class="loading-state">Failed to load tasks.</div>'; });
}

// ===== LOAD ALL TASKS (Admin) =====
function loadAllTasks() {
    const container = document.getElementById('all-tasks-list');
    container.innerHTML = '<div class="loading-state">Loading…</div>';

    fetch(BASE_URL + "/tasks")
    .then(res => res.json())
    .then(data => {
        const tasks = data.tasks || [];
        if (!tasks.length) {
            container.innerHTML = '<div class="loading-state">No tasks yet.</div>';
            return;
        }
        container.innerHTML = tasks.map(renderTaskCard).join('');
    })
    .catch(() => { container.innerHTML = '<div class="loading-state">Failed to load tasks.</div>'; });
}

// ===== DASHBOARD =====
function loadDashboard() {
    ['stat-total','stat-completed','stat-pending','stat-overdue'].forEach(id => {
        document.getElementById(id).textContent = '…';
    });

    fetch(BASE_URL + "/dashboard")
    .then(res => res.json())
    .then(data => {
        document.getElementById('stat-total').textContent     = data.total_tasks;
        document.getElementById('stat-completed').textContent = data.completed_tasks;
        document.getElementById('stat-pending').textContent   = data.pending_tasks;
        document.getElementById('stat-overdue').textContent   = data.overdue_tasks;

        // Team breakdown
        if (data.user_breakdown) {
            const breakdown = document.getElementById('team-breakdown');
            breakdown.innerHTML = data.user_breakdown.map(u => `
                <div class="task-card">
                    <div class="task-top">
                        <span class="task-title">👤 ${u.name}</span>
                        <span class="task-status status-wip">${u.task_count} task${u.task_count !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="task-meta">
                        <span class="meta-item">✅ ${u.completed} completed</span>
                        <span class="meta-item">⏳ ${u.pending} pending</span>
                    </div>
                </div>
            `).join('');
        }
    })
    .catch(() => {
        ['stat-total','stat-completed','stat-pending','stat-overdue'].forEach(id => {
            document.getElementById(id).textContent = '—';
        });
    });
}