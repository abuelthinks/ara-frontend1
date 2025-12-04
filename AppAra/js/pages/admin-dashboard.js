// Admin Dashboard JS

window.onload = function () {
    // Require authenticated ADMIN via shared Auth helper
    if (window.Auth && typeof Auth.requireRole === 'function') {
        const ok = Auth.requireRole('ADMIN');
        if (!ok) {
            // requireRole already redirected
            return;
        }
    } else {
        // Fallback if Auth.js did not load (dev-only)
        const userStatus = sessionStorage.getItem('userStatus');
        const userEmail = sessionStorage.getItem('userEmail');
        if (!userStatus || userStatus !== 'Admin') {
            const base = window.BASE_URL || '';
            window.location.href = `${base}/html/login.html`;
            return;
        }
        document.getElementById('userEmail').textContent = userEmail || '';
        return;
    }

    // Show email from real JWT user data
    const user = Auth.getCurrentUser ? Auth.getCurrentUser() : null;
    if (user && user.email) {
        document.getElementById('userEmail').textContent = user.email;
    }
};

// Navigation helpers (frontend-only routing between HTML pages)
function navigateTo(page) {
    const base = window.BASE_URL || '';
    switch (page) {
        case 'students-enrolled':
            window.location.href = `${base}/html/students-enrolled.html`;
            break;
        case 'students-assessment':
            window.location.href = `${base}/html/assessment-generator.html`;
            break;
        case 'students-assessed':
            window.location.href = `${base}/html/students-assessed.html`;
            break;
        case 'weekly-progress':
            window.location.href = `${base}/html/weekly-progress.html?action=list`;
            break;
        case 'iep-generation':
            window.location.href = `${base}/html/iep-generation.html`;
            break;
    }
}

// Handle progress report actions (generate, download, share)
function handleProgressReport(action, studentId) {
    const base = window.BASE_URL || '';
    switch (action) {
        case 'generate':
            window.location.href =
                `${base}/html/weekly-progress.html?action=generate&studentId=${studentId}`;
            break;
        case 'download':
            window.location.href =
                `${base}/html/weekly-progress.html?action=download&studentId=${studentId}`;
            break;
        case 'share':
            window.location.href =
                `${base}/html/weekly-progress.html?action=share&studentId=${studentId}`;
            break;
    }
}
