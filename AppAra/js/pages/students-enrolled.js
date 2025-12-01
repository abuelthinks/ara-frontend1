// Check authentication
window.onload = function() {
    const userStatus = sessionStorage.getItem('userStatus');
    const userEmail = sessionStorage.getItem('userEmail');
    
    if (!userStatus || userStatus !== 'Admin') {
        window.location.href = '../html/login.html';
        return;
    }
    
    document.getElementById('userEmail').textContent = userEmail;
    loadStudents();
};

function loadStudents() {
    const sampleStudents = [
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Smith" },
        // Add more sample students as needed
    ];

    const studentList = document.querySelector('.student-list');
    
    window.allStudents = sampleStudents;
    displayStudents(sampleStudents);
}

function displayStudents(students) {
    const studentList = document.querySelector('.student-list');
    studentList.innerHTML = ''; // Clear current list
    
    students.forEach(student => {
        const studentCard = createStudentCard(student);
        studentList.appendChild(studentCard);
    });
}

function createStudentCard(student) {
    const card = document.createElement('div');
    card.className = 'student-card';
    
    const initials = student.name.split(' ').map(n => n[0]).join('');
    
    card.innerHTML = `
        <div class="student-info">
            <div class="student-avatar">${initials}</div>
            <h3>${student.name}</h3>
        </div>
        <div class="document-list" id="docs-${student.id}">
            <a href="#" class="document-link" onclick="viewDocument('assessment', ${student.id})">
                LD-001 SPED ASSESSMENT
            </a>
            <a href="#" class="document-link" onclick="viewDocument('iep', ${student.id})">
                IEP
            </a>
            <a href="#" class="document-link" onclick="viewDocument('progress', ${student.id})">
                LD-R001 Weekly Progress Report
            </a>
        </div>
    `;

    card.querySelector('h3').addEventListener('click', () => {
        const docList = card.querySelector('.document-list');
        docList.style.display = docList.style.display === 'none' ? 'block' : 'none';
    });

    return card;
}

function viewDocument(type, studentId) {
    // Handle document viewing based on type and student ID
    switch(type) {
        case 'assessment':
            window.location.href = `assessment-view.html?student=${studentId}`;
            break;
        case 'iep':
            window.location.href = `iep-view.html?student=${studentId}`;
            break;
        case 'progress':
            window.location.href = `weekly-progress-view.html?student=${studentId}`;
            break;
    }
}

// Function to go back to admin dashboard
function goToAdminDashboard() {
    window.location.href = '../html/admin-dashboard.html';
}

// Function to handle logout
function handleLogout() {
    // Clear any session data if needed
    sessionStorage.clear();
    // Redirect to login page
    window.location.href = '../html/login.html';
}

// Update search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filteredStudents = window.allStudents.filter(student => 
                student.name.toLowerCase().includes(searchTerm)
            );
            displayStudents(filteredStudents);
        });
    }
});

