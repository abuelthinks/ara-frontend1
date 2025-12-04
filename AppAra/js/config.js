/**
 * Centralized Configuration
 * Update API_BASE_URL for different environments
 */


const CONFIG = {
  ENV: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'development' : 'production',
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000/api'
    : 'https://ara-test1-ca0b96725df3.herokuapp.com/api',
    
  // API Endpoints
  ENDPOINTS: {
    AUTH_LOGIN: '/auth/login/',
    AUTH_REGISTER: '/auth/register/',
    AUTH_LOGOUT: '/auth/logout/',
    CHILDREN: '/children/',
    IEP: '/iep/',
    ASSESSMENTS: '/assessments/',
    PROGRESS: '/progress/',
    USERS: '/users/',
  },
  
  // Token keys
  TOKEN_KEY: 'ara_auth_token',
  USER_KEY: 'ara_current_user',
  
  // Features
  FEATURES: {
    AUTO_LOGOUT_MINUTES: 30,
    REFRESH_TOKEN_ENABLED: true,
  }
};


window.CONFIG = CONFIG;
console.log('[CONFIG] Using API:', CONFIG.API_BASE_URL);