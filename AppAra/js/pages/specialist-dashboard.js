// Specialist Dashboard JS

window.addEventListener('load', () => {
    // 1) Require SPECIALIST role via Auth helper
    if (window.Auth && typeof Auth.requireRole === 'function') {
        const ok = Auth.requireRole('SPECIALIST');
        if (!ok) {
            // requireRole already redirected to login/home
            return;
        }
    } else {
        // Fallback (dev-only) using old sessionStorage flags
        const userStatus = sessionStorage.getItem('userStatus');
        const userEmail = sessionStorage.getItem('userEmail');

        if (userStatus !== 'Specialist') {
            const base = window.BASE_URL || '';
            window.location.href = `${base}/html/login.html`;
            return;
        }
        const emailEl = document.getElementById('specialistEmail');
        if (emailEl) emailEl.textContent = userEmail || '';
        return;
    }

    // 2) Show email from real JWT user object
    if (typeof Auth.getCurrentUser === 'function') {
        const user = Auth.getCurrentUser();
        const emailEl = document.getElementById('specialistEmail');
        if (user && user.email && emailEl) {
            emailEl.textContent = user.email;
        }
    }

    // 3) Wire buttons to use BASE_URL-safe navigation
    setupNavigation();
});

function setupNavigation() {
    const base = window.BASE_URL || '';

    const assessmentBtn = document.querySelector(
        '.action-card:nth-child(1) .action-btn'
    );
    const progressBtn = document.querySelector(
        '.action-card:nth-child(2) .action-btn'
    );

    if (assessmentBtn) {
        assessmentBtn.addEventListener('click', () => {
            window.location.href = `${base}/html/specialist/specialist-assessment.html`;
        });
    }

    if (progressBtn) {
        progressBtn.addEventListener('click', () => {
            window.location.href = `${base}/html/specialist/specialist-progress-report.html`;
        });
    }
}
