/**
 * Parent Signup
 * Registers new parent account and redirects to parent-input.html
 */

// Password requirements validation
function validatePassword(password) {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password)
    };
}

function isPasswordValid(password) {
    const req = validatePassword(password);
    return req.length && req.uppercase && req.lowercase && req.number;
}

function updatePasswordRequirements(password) {
    const req = validatePassword(password);
    const requirements = {
        'req-length': req.length,
        'req-uppercase': req.uppercase,
        'req-lowercase': req.lowercase,
        'req-number': req.number
    };

    document.getElementById('passwordRequirements').classList.add('show');

    Object.entries(requirements).forEach(([id, isMet]) => {
        const element = document.getElementById(id);
        if (isMet) {
            element.classList.remove('unmet');
            element.classList.add('met');
            element.innerHTML = '<i class="fas fa-check"></i>';
        } else {
            element.classList.remove('met');
            element.classList.add('unmet');
            element.innerHTML = '<i class="fas fa-circle"></i>';
        }
    });
}

function clearError(fieldId) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}Error`);
    input.classList.remove('error');
    errorEl.classList.remove('show');
}

function showError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}Error`);
    input.classList.add('error');
    errorEl.textContent = message;
    errorEl.classList.add('show');
}

window.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const form = document.getElementById('signupForm');

    // Password visibility toggle
    togglePassword.addEventListener('click', (e) => {
        e.preventDefault();
        const isHidden = passwordInput.type === 'password';
        passwordInput.type = isHidden ? 'text' : 'password';
        togglePassword.innerHTML = isHidden ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });

    toggleConfirmPassword.addEventListener('click', (e) => {
        e.preventDefault();
        const isHidden = confirmPasswordInput.type === 'password';
        confirmPasswordInput.type = isHidden ? 'text' : 'password';
        toggleConfirmPassword.innerHTML = isHidden ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });

    // Real-time password validation
    passwordInput.addEventListener('input', (e) => {
        clearError('password');
        updatePasswordRequirements(e.target.value);
    });

    confirmPasswordInput.addEventListener('input', () => {
        clearError('confirmPassword');
    });

    // Input validation on blur
    document.getElementById('parentName').addEventListener('blur', function() {
        if (!this.value.trim()) {
            showError('parentName', 'Please enter your full name');
        } else if (this.value.trim().length < 2) {
            showError('parentName', 'Name must be at least 2 characters');
        } else {
            clearError('parentName');
        }
    });

    document.getElementById('email').addEventListener('blur', function() {
        if (!this.value.trim()) {
            showError('email', 'Please enter your email');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value)) {
            showError('email', 'Please enter a valid email address');
        } else {
            clearError('email');
        }
    });

    document.getElementById('mobile').addEventListener('blur', function() {
        if (!this.value.trim()) {
            showError('mobile', 'Please enter your mobile number');
        } else if (this.value.trim().length < 10) {
            showError('mobile', 'Please enter a valid mobile number');
        } else {
            clearError('mobile');
        }
    });
});

async function handleSignup(event) {
    event.preventDefault();

    const parentName = document.getElementById('parentName').value.trim();
    const email = document.getElementById('email').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');

    // Clear all errors
    ['parentName', 'email', 'mobile', 'password', 'confirmPassword'].forEach(id => {
        clearError(id);
    });

    // Validate
    let hasError = false;

    if (!parentName || parentName.length < 2) {
        showError('parentName', 'Please enter your full name (at least 2 characters)');
        hasError = true;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('email', 'Please enter a valid email address');
        hasError = true;
    }

    if (!mobile || mobile.length < 10) {
        showError('mobile', 'Please enter a valid mobile number');
        hasError = true;
    }

    if (!isPasswordValid(password)) {
        showError('password', 'Password does not meet requirements');
        hasError = true;
    }

    if (password !== confirmPassword) {
        showError('confirmPassword', 'Passwords do not match');
        hasError = true;
    }

    if (hasError) return;

    // Show loading state
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading-spinner"></span>';

    try {
        // Call signup endpoint using API wrapper
        const response = await API.post(CONFIG.ENDPOINTS.AUTH_REGISTER, {
            email: email,
            first_name: parentName,
            phone: mobile,
            password: password,
            confirm_password: confirmPassword
        });

        if (response && response.access && response.refresh && response.user) {
            // Store token using Auth helper
            Auth.setToken(response.access, response.refresh, response.user);
            
            // Mark as first login
            localStorage.setItem('parentIsFirstLogin', 'true');
            
            // Show success message
            successMessage.textContent = 'Account created successfully! Redirecting...';
            successMessage.classList.add('show');

            // Redirect to parent-input.html (Step 1)
            setTimeout(() => {
                const base = window.BASE_URL || '/AppAra';
                window.location.href = `${base}/html/parent/parent-input.html`;
            }, 1500);
        }

    } catch (error) {
        console.error('Signup error:', error);
        const errorMsg = error.message || 'Failed to create account. Please try again.';
        
        // Try to identify which field the error is about
        if (errorMsg.includes('email') || errorMsg.includes('already')) {
            showError('email', 'This email is already registered. Please use a different one.');
        } else if (errorMsg.includes('password')) {
            showError('password', errorMsg);
        } else {
            showError('email', errorMsg);
        }

        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

