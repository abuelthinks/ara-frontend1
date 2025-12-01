const users = [
    { email: 'tryadmin@gg.com', password: '1.try23', status: 'Admin' },
    { email: 'teach@gg.com', password: '1.try23', status: 'Teacher' },
    { email: 'parent@gg.com', password: '1.try23', status: 'Parent' },
    { email: 'specialist@gg.com', password: '1.try23', status: 'Specialist' }
];

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

// Modified validateLogin function
function validateLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Store user status in session storage
        sessionStorage.setItem('userStatus', user.status);
        sessionStorage.setItem('userEmail', user.email);
        
        // Redirect based on user status
        switch(user.status) {
            case 'Admin':
                window.location.href = 'admin-dashboard.html';
                break;
            case 'Teacher':
                window.location.href = 'teacher-dashboard.html';
                break;
            case 'Parent':
                window.location.href = 'parent-dashboard.html';
                break;
            case 'Specialist':
                window.location.href = 'specialist-dashboard.html';
                break;
        }
    } else {
        showError('Invalid email or password');
    }
    return false;
}

// Initialize shapes on load
createShapes();

