// Add floating shapes animation
function createShapes() {
    const shapes = document.querySelector('.shapes');
    if (!shapes) return;

    for (let i = 0; i < 15; i++) {
        const shape = document.createElement('div');
        shape.classList.add('shape');
        shape.style.width = Math.random() * 100 + 'px';
        shape.style.height = shape.style.width;
        shape.style.left = Math.random() * 100 + '%';
        shape.style.top = Math.random() * 100 + '%';
        shape.style.animation = `float ${Math.random() * 10 + 5}s linear infinite`;
        shapes.appendChild(shape);
    }
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    if (!errorMessage) return;
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    errorMessage.style.display = 'block';
}

function hideError() {
    const errorMessage = document.getElementById('errorMessage');
    if (!errorMessage) return;
    errorMessage.classList.remove('show');
    errorMessage.style.display = 'none';
}

// Main login handler (email OR username)
async function handleLoginSubmit(event) {
    event.preventDefault();

    const identifierInput = document.getElementById('email');      // can be email or username
    const passwordInput   = document.getElementById('password');
    const spinner         = document.getElementById('spinner');
    const btn             = document.getElementById('loginBtn');

    const identifier = identifierInput ? identifierInput.value : '';
    const password   = passwordInput ? passwordInput.value : '';

    if (!window.Auth || typeof Auth.login !== 'function') {
        showError('Authentication service not available.');
        return;
    }

    // UI: loading state
    if (spinner) spinner.classList.add('show');
    if (btn) btn.disabled = true;
    hideError();

    try {
        console.log('[Login] Attempting with identifier:', identifier);

        // Auth.login(username, password) – backend accepts username OR email
        const result = await Auth.login(identifier, password);

        if (spinner) spinner.classList.remove('show');
        if (btn) btn.disabled = false;

        const user = result.user;
        if (!user) {
            showError('Invalid response from server.');
            return;
        }

        const role = (user.role || 'PARENT').toUpperCase();
        console.log('[Login] Success! User:', user.username || user.email, 'Role:', role);

        // Smart redirect based on role
        if (role === 'PARENT') {
            redirectParent(user);
        } else {
            // For other roles, use standard redirect
            Auth.redirectToDashboard(role);
        }
    } catch (error) {
        console.error('[Login] Error:', error);
        if (spinner) spinner.classList.remove('show');
        if (btn) btn.disabled = false;
        showError(error.message || 'Invalid username/email or password.');
    }
}

// --- Smart Parent Redirect ---
async function redirectParent(user) {
    const base = window.BASE_URL || '/AppAra';
    
    console.log('[Redirect] Parent login, sending to parent-dashboard.html');
    
    // All parents go straight to dashboard
    setTimeout(() => {
        window.location.href = `${base}/html/parent/parent-dashboard.html`;
    }, 500);
}


// Auto‑redirect if already logged in
function checkAlreadyAuthenticated() {
    if (!window.Auth) {
        console.warn('[Login] Auth not available on load');
        return;
    }

    console.log('[Login] Checking if already authenticated...');
    if (Auth.isAuthenticated()) {
        const user = Auth.getCurrentUser();
        if (user) {
            const role = (user.role || 'PARENT').toUpperCase();
            console.log('[Login] Already authenticated as:', user.username || user.email, 'Role:', role);
            
            if (role === 'PARENT') {
                redirectParent(user);
            } else {
                Auth.redirectToDashboard(role);
            }
        }
    } else {
        console.log('[Login] Not authenticated, showing login form');
    }
}

// Wire up events on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    createShapes();
    checkAlreadyAuthenticated();

    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', handleLoginSubmit);
    }
});