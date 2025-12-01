// Check if user is logged in as specialist
window.onload = function() {
    const userStatus = sessionStorage.getItem('userStatus');
    const userEmail = sessionStorage.getItem('userEmail');
    
    if (userStatus !== 'Specialist') {
        window.location.href = '../html/login.html';
        return;
    }
    
    document.getElementById('specialistEmail').textContent = userEmail;
}

function logout() {
    sessionStorage.clear();
    window.location.href = '../html/login.html';
}

