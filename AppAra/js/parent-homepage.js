window.onload = function() {
    const userStatus = sessionStorage.getItem('userStatus');
    if (!userStatus || userStatus !== 'Parent') {
        window.location.href = '../html/login.html';
    }
}

function logout() {
    sessionStorage.clear();
    window.location.href = '../html/login.html';
}

