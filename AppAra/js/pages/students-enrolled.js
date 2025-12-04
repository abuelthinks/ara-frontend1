// Students Enrolled - Admin view

window.addEventListener('load', async () => {
    // 1) Require correct role (ADMIN only; change to requireAnyRole if needed)
    if (window.Auth && typeof Auth.requireRole === 'function') {
        const ok = Auth.requireRole('ADMIN');
        if (!ok) {
            // requireRole already redirected
            return;
        }
    } else {
        // Fallback if auth.js is not loaded (dev-only)
        const userStatus = sessionStorage.getItem('userStatus');
        const userEmail = sessionStorage.getItem('userEmail');
        if (!userStatus || userStatus !== 'Admin') {
            const base = window.BASE_URL || '';
            window.location.href = `${base}/html/login.html`;
            return;
        }
        const emailEl = document.getElementById('userEmail');
        if (emailEl) emailEl.textContent = userEmail || '';
    }

    // 2) Show email from real JWT user data
    if (window.Auth && typeof Auth.getCurrentUser === 'function') {
        const user = Auth.getCurrentUser();
        const emailEl = document.getElementById('userEmail');
        if (user && user.email && emailEl) {
            emailEl.textContent = user.email;
        }
    }

    // 3) Wire search box
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            const term = e.target.value.toLowerCase();
            const source = window.allStudents || [];
            const filtered = source.filter(s =>
                (s.name || '').toLowerCase().includes(term)
            );
            displayStudents(filtered);
        });
    }

    // 4) Load students from backend
    await loadStudents();
});

// -------------------------------------------
// Load students from /children/ endpoint
// -------------------------------------------
async function loadStudents() {
    const studentList = document.querySelector('.student-list');
    if (!studentList) return;

    try {
        if (!window.API || typeof API.get !== 'function') {
            console.warn('[StudentsEnrolled] API wrapper not available; using sample data');
            const sampleStudents = [
                { id: 1, name: 'John Doe' },
                { id: 2, name: 'Jane Smith' },
            ];
            window.allStudents = sampleStudents;
            displayStudents(sampleStudents);
            return;
        }

        // GET /children/
        const response = await API.get(CONFIG.ENDPOINTS.CHILDREN);

        // Handle both array and paginated object { results: [...] }
        const children = Array.isArray(response)
            ? response
            : (response && Array.isArray(response.results))
                ? response.results
                : [];

        const normalized = children.map(child => {
            const first = child.first_name || '';
            const last = child.last_name || '';
            const full =
                child.full_name ||
                child.name ||
                `${first} ${last}`.trim() ||
                'Unnamed student';
            return {
                id: child.id,
                name: full,
            };
        });

        window.allStudents = normalized;
        displayStudents(normalized);
    } catch (error) {
        console.error('[StudentsEnrolled] Failed to load students:', error);
        alert('Failed to load enrolled students. Please try again later.');
        studentList.innerHTML = '<p class="error">Unable to load students.</p>';
    }
}

// -------------------------------------------
// Render helpers
// -------------------------------------------
function displayStudents(students) {
    const studentList = document.querySelector('.student-list');
    if (!studentList) return;

    studentList.innerHTML = '';

    (students || []).forEach(student => {
        const card = createStudentCard(student);
        studentList.appendChild(card);
    });
}

function createStudentCard(student) {
    const card = document.createElement('div');
    card.className = 'student-card';

    const initials = (student.name || '')
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .toUpperCase();

    card.innerHTML = `
        <div class="student-info">
            <div class="student-avatar">${initials || '?'}</div>
            <h3>${student.name}</h3>
        </div>
        <div class="document-list" id="docs-${student.id}">
            <a href="#" class="document-link" data-type="assessment" data-id="${student.id}">
                LD-001 SPED ASSESSMENT
            </a>
            <a href="#" class="document-link" data-type="iep" data-id="${student.id}">
                IEP
            </a>
            <a href="#" class="document-link" data-type="progress" data-id="${student.id}">
                LD-R001 Weekly Progress Report
            </a>
        </div>
    `;

    // Toggle docs on name click
    const title = card.querySelector('h3');
    const docList = card.querySelector('.document-list');
    if (title && docList) {
        docList.style.display = 'none';
        title.addEventListener('click', () => {
            docList.style.display =
                docList.style.display === 'none' ? 'block' : 'none';
        });
    }

    // Delegate clicks on document links
    card.querySelectorAll('.document-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const type = link.getAttribute('data-type');
            const id = link.getAttribute('data-id');
            viewDocument(type, id);
        });
    });

    return card;
}

// -------------------------------------------
// Navigation helpers
// -------------------------------------------
function viewDocument(type, studentId) {
    const base = window.BASE_URL || '';
    switch (type) {
        case 'assessment':
            window.location.href =
                `${base}/html/assessment-view.html?student=${studentId}`;
            break;
        case 'iep':
            window.location.href =
                `${base}/html/iep-view.html?student=${studentId}`;
            break;
        case 'progress':
            window.location.href =
                `${base}/html/weekly-progress-view.html?student=${studentId}`;
            break;
    }
}

// Back to admin dashboard
function goToAdminDashboard() {
    const base = window.BASE_URL || '';
    window.location.href = `${base}/html/admin-dashboard.html`;
}
