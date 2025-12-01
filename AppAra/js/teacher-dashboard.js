// Check if user is logged in as teacher
window.onload = function() {
    const userStatus = sessionStorage.getItem('userStatus');
    const userEmail = sessionStorage.getItem('userEmail');
    
    if (userStatus !== 'Teacher') {
        window.location.href = '../html/login.html';
        return;
    }
    
    document.getElementById('teacherEmail').textContent = userEmail;
}

function logout() {
    sessionStorage.clear();
    window.location.href = '../html/login.html';
}

function submitForm(event) {
    event.preventDefault();
    const submitBtn = document.querySelector('.submit-btn');
    const loadingIcon = submitBtn.querySelector('.loading');
    const submitText = submitBtn.querySelector('span');
    const submitIcon = submitBtn.querySelector('.fa-paper-plane');
    
    // Show loading state
    submitBtn.disabled = true;
    loadingIcon.style.display = 'inline-block';
    submitIcon.style.display = 'none';
    submitText.textContent = 'Submitting...';

    // Simulate API call
    setTimeout(() => {
        alert('Form submitted successfully!');
        
        // Reset button state
        submitBtn.disabled = false;
        loadingIcon.style.display = 'none';
        submitIcon.style.display = 'inline-block';
        submitText.textContent = 'Submit Report';
    }, 1500);

    return false;
}

