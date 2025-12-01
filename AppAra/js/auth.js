import { startTokenRefreshTimer, stopTokenRefreshTimer } from './tokenManager.js';

// --- Dynamic BASE_URL ---
function getBaseURL() {
  const repoName = 'ara-frontend1';
  const appFolder = 'AppAra';
  const pathname = window.location.pathname;
  if (pathname.includes(`/${repoName}`)) {
    return `/${repoName}/${appFolder}`;
  } else {
    return '';
  }
}
const BASE_URL = getBaseURL();

// Key names for localStorage
const ACCESS_KEY = 'ara_jwt_access';
const REFRESH_KEY = 'ara_jwt_refresh';
const USER_KEY = 'ara_current_user';

const login = async (username, password) => {
  try {
    console.log('[Auth] Attempting login with username:', username);
    const url = `${CONFIG.API_BASE_URL}/auth/login/`;
    console.log('[Auth] Login URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    console.log('[Auth] Response status:', response.status);
    const data = await response.json();
    console.log('[Auth] Response data:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Expect JWT: { access, refresh, user }
    if (!data.access || !data.refresh || !data.user) {
      console.error('[Auth] Invalid response structure. Expected {access,refresh,user}, got:', data);
      throw new Error('Invalid login response from server');
    }

    localStorage.setItem(ACCESS_KEY, data.access);
    localStorage.setItem(REFRESH_KEY, data.refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    console.log(`[Auth] Login successful: ${data.user.username} (${data.user.role})`);

    // Start auto-refresh timer for token
    startTokenRefreshTimer(data.refresh);
    console.log('[Auth] Token refresh timer started');

    // Let caller decide where to redirect
    return data;
  } catch (error) {
    console.error('[Auth] Login error:', error.message);
    throw error;
  }
};

const redirectToDashboard = (role) => {
  const redirectMap = {
    'PARENT': 'html/parent-dashboard.html',
    'TEACHER': 'html/teacher-dashboard.html',
    'SPECIALIST': 'html/specialist-dashboard.html',
    'ADMIN': 'html/admin-dashboard.html',
  };
  const redirectUrl = redirectMap[role] || 'html/parent-dashboard.html';
  console.log(`[Auth] Redirecting ${role} to ${BASE_URL}/${redirectUrl}`);
  window.location.href = `${BASE_URL}/${redirectUrl}`;
};

const logout = async () => {
  try {
    // Stop auto-refresh timer for token
    stopTokenRefreshTimer();
    console.log('[Auth] Token refresh timer stopped');

    const access = localStorage.getItem(ACCESS_KEY);
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (refresh) {
      await fetch(`${CONFIG.API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
      });
    }
  } catch (error) {
    console.error('[Auth] Logout error:', error);
  } finally {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = `${BASE_URL}/`;
  }
};

const getCurrentUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

const isAuthenticated = () =>
  !!localStorage.getItem(ACCESS_KEY) && !!localStorage.getItem(USER_KEY);

const hasRole = (requiredRole) => {
  const user = getCurrentUser();
  return user && user.role === requiredRole;
};

const hasAnyRole = (roles) => {
  const user = getCurrentUser();
  return user && roles.includes(user.role);
};

const requireRole = (requiredRole) => {
  if (!isAuthenticated()) {
    console.warn('[Auth] Not authenticated, redirecting to login');
    window.location.href = `${BASE_URL}/`;
    return false;
  }
  const user = getCurrentUser();
  if (user.role !== requiredRole) {
    console.error(`[Auth] User ${user.username} (${user.role}) tried to access ${requiredRole} page`);
    alert(`Access denied. This page is for ${requiredRole}s only.`);
    window.location.href = `${BASE_URL}/`;
    return false;
  }
  return true;
};

const requireAnyRole = (roles) => {
  if (!isAuthenticated()) {
    console.warn('[Auth] Not authenticated, redirecting to login');
    window.location.href = `${BASE_URL}/`;
    return false;
  }
  const user = getCurrentUser();
  if (!roles.includes(user.role)) {
    console.error(`[Auth] User ${user.username} (${user.role}) tried to access restricted page`);
    alert(`Access denied. This page is for ${roles.join(', ')} only.`);
    window.location.href = `${BASE_URL}/`;
    return false;
  }
  return true;
};

export {
  login,
  logout,
  getCurrentUser,
  getAccessToken,
  getRefreshToken,
  isAuthenticated,
  hasRole,
  hasAnyRole,
  requireRole,
  requireAnyRole,
  redirectToDashboard,
};

// Expose helpers on window for non-module scripts
window.Auth = {
  login,
  logout,
  getCurrentUser,
  getAccessToken,
  getRefreshToken,
  isAuthenticated,
  hasRole,
  hasAnyRole,
  requireRole,
  requireAnyRole,
  redirectToDashboard,
};
