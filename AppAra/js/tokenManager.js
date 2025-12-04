// tokenManager.js
const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000; // example: 15 minutes
let refreshTimer = null;

function startTokenRefreshTimer(refreshToken) {
    if (refreshTimer) clearInterval(refreshTimer);

    refreshTimer = setInterval(async () => {
        try {
            const url = `${CONFIG.API_BASE_URL}/token/refresh/`; // adjust if backend path differs
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                // use same key as auth.js
                localStorage.setItem('ara_jwt_access', data.access);
                console.log('Token refreshed automatically');
            } else if (window.Auth) {
                Auth.logout();
            }
        } catch (error) {
            console.error('Token refresh error:', error);
        }
    }, TOKEN_REFRESH_INTERVAL);
}

function stopTokenRefreshTimer() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
}

// expose globally
window.TokenManager = {
    startTokenRefreshTimer,
    stopTokenRefreshTimer,
};
