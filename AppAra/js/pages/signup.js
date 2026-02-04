/**
 * Parent Signup
 * Registers new parent account and redirects to parent-input.html
 */

function generatePassword(len = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let out = '';
    for (let i = 0; i < len; i++) {
        out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
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
    const form = document.getElementById('signupForm');

    const usernameInput = document.getElementById('username');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const resendBtn = document.getElementById('resendBtn');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (usernameInput) {
        usernameInput.addEventListener('blur', function() {
            // optional, only validate if provided
            if (this.value && this.value.trim().length < 2) {
                showError('username', 'Username must be at least 2 characters');
            } else {
                clearError('username');
            }
        });
    }

    if (firstNameInput) {
        firstNameInput.addEventListener('blur', function() {
            // optional, no strict validation
            clearError('firstName');
        });
    }

    if (lastNameInput) {
        lastNameInput.addEventListener('blur', function() {
            // optional, no strict validation
            clearError('lastName');
        });
    }

    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (!this.value.trim()) {
                showError('email', 'Please enter your email');
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value)) {
                showError('email', 'Please enter a valid email address');
            } else {
                clearError('email');
            }
        });
    }

    if (resendBtn) {
        resendBtn.addEventListener('click', () => {
            alert('Resent! For demo, you can proceed to login.');
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('blur', function() {
            const val = this.value || '';
            const okLen = val.length >= 8;
            const hasUpper = /[A-Z]/.test(val);
            const hasLower = /[a-z]/.test(val);
            const hasDigit = /[0-9]/.test(val);
            if (!okLen || !hasUpper || !hasLower || !hasDigit) {
                showError('password', 'Use 8+ chars with A-Z, a-z and 0-9');
            } else {
                clearError('password');
            }
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('blur', function() {
            const val = this.value || '';
            const pwd = passwordInput ? passwordInput.value : '';
            if (!val || val !== pwd) {
                showError('confirmPassword', 'Passwords do not match');
            } else {
                clearError('confirmPassword');
            }
        });
    }
});

async function handleSignup(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    const errorBanner = document.getElementById('errorBanner');

    // Clear all errors
    ['username', 'firstName', 'lastName', 'email', 'password', 'confirmPassword'].forEach(id => {
        clearError(id);
    });
    if (errorBanner) {
        errorBanner.classList.remove('show');
        errorBanner.textContent = '';
        errorBanner.style.display = 'none';
    }

    // Validate
    let hasError = false;

    // Require at least one of first or last name
    if (!firstName) {
        showError('firstName', 'First name is required');
        hasError = true;
    }
    if (!lastName) {
        showError('lastName', 'Last name is required');
        hasError = true;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('email', 'Please enter a valid email address');
        hasError = true;
    }
    const okLen = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    if (!okLen || !hasUpper || !hasLower || !hasDigit) {
        showError('password', 'Use 8+ chars with A-Z, a-z and 0-9');
        hasError = true;
    }
    if (!confirmPassword || confirmPassword !== password) {
        showError('confirmPassword', 'Passwords do not match');
        hasError = true;
    }

    if (hasError) return;

    // Show loading state
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading-spinner" aria-hidden="true"></span><span>Creating...</span>';

    try {
        // Call signup endpoint using API wrapper
        // Derive username if blank from first+last (no spaces, lowercased)
        const derivedUsername = (username || (firstName + lastName)).replace(/\s+/g, '').toLowerCase();
        const response = await API.post(CONFIG.ENDPOINTS.AUTH_REGISTER, {
            email: email,
            username: derivedUsername,
            first_name: firstName,
            last_name: lastName,
            phone: '',
            password: password,
            confirm_password: confirmPassword
        });

        if (response && response.access && response.refresh && response.user) {
            // Mark as first login
            localStorage.setItem('parentIsFirstLogin', 'true');
            
            // Show confirmation screen
            const confirmationScreen = document.getElementById('confirmationScreen');
            const formEl = document.getElementById('signupForm');
            if (formEl) formEl.style.display = 'none';
            if (confirmationScreen) confirmationScreen.style.display = 'block';

            // Stay on confirmation page; user uses the link to go to login
        }

    } catch (error) {
        console.error('Signup error:', error);
        const rawMsg = error && error.message ? error.message : '';
        const isNetwork = rawMsg.toLowerCase().includes('failed to fetch') || rawMsg.toLowerCase().includes('network');
        const errorMsg = isNetwork 
            ? 'Unable to reach the server. If you opened this page from a file path, please run the frontend on http://localhost:8001 and ensure the backend is reachable.'
            : (rawMsg || 'Failed to create account. Please try again.');

        if (errorBanner) {
            errorBanner.textContent = errorMsg;
            errorBanner.classList.add('show');
            errorBanner.style.display = 'block';
        } else {
            showError('email', errorMsg);
        }

        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

