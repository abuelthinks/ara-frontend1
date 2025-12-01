// tokenManager.js

const TOKEN_REFRESH_INTERVAL = 29 * 60 * 1000; // 29 minutes before 30 min expiry

let refreshTimer = null;

export const startTokenRefreshTimer = (refreshToken) => {
    if (refreshTimer) clearInterval(refreshTimer);

    refreshTimer = setInterval(async () => {
        try {
            const response = await fetch('https://ara-test1-ca0b96725df3.herokuapp.com/api/token/refresh/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('access_token', data.access);
                console.log('Token refreshed automatically');
            } else {
                logout(); // Make sure logout() is imported or available here
            }
        } catch (error) {
            console.error('Token refresh error:', error);
        }
    }, TOKEN_REFRESH_INTERVAL);
};

export const stopTokenRefreshTimer = () => {
    if (refreshTimer) clearInterval(refreshTimer);
};
