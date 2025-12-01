// Add floating shapes animation
function createShapes() {
    const shapes = document.querySelector('.shapes');
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

// Update error message display
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'block';
    errorMessage.textContent = message;
}

// Backend-powered validateLogin using Auth helpers
async function validateLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        if (!window.Auth || typeof Auth.login !== 'function') {
            throw new Error('Authentication service not available');
        }

        const result = await Auth.login(email, password);
        const role = result.user?.role;

        if (!role) {
            throw new Error('No role returned for this user.');
        }

        // Use shared redirect helper so role → dashboard mapping is centralized
        Auth.redirectToDashboard(role);
    } catch (error) {
        console.error('Login failed:', error);
        showError(error.message || 'Invalid email or password');
    }

    return false;
}

// Initialize shapes on load
createShapes();

