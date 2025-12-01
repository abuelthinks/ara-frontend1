// Check if user is logged in and is an admin
window.onload = function() {
    const userStatus = sessionStorage.getItem('userStatus');
    const userEmail = sessionStorage.getItem('userEmail');
    
    if (!userStatus || userStatus !== 'Admin') {
        window.location.href = '../html/login.html';
        return;
    }
    
    document.getElementById('userEmail').textContent = userEmail;
};

function logout() {
    sessionStorage.clear();
    window.location.href = '../html/login.html';
}

function navigateTo(page) {
    switch(page) {
        case 'students-enrolled':
            window.location.href = 'students-enrolled.html';
            break;
        case 'students-assessment':
            window.location.href = 'assessment-generator.html';
            break;
        case 'students-assessed':
            window.location.href = 'assessed-students.html';
            break;
        case 'weekly-progress':
            window.location.href = 'weekly-progress.html?action=list';
            break;
        case 'iep-generation':
            window.location.href = 'iep-generation.html';
            break;
    }
}

// Add new function to handle progress report actions
function handleProgressReport(action, studentId) {
    switch(action) {
        case 'generate':
            window.location.href = `weekly-progress.html?action=generate&studentId=${studentId}`;
            break;
        case 'download':
            window.location.href = `weekly-progress.html?action=download&studentId=${studentId}`;
            break;
        case 'share':
            window.location.href = `weekly-progress.html?action=share&studentId=${studentId}`;
            break;
    }
}

