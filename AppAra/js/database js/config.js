/**
 * Centralized Configuration
 * Update API_BASE_URL for different environments
 */

const CONFIG = {
  ENV: window.location.hostname.includes('localhost') ? 'development' : 'production',
  API_BASE_URL: window.location.hostname.includes('localhost')
    ? 'http://localhost:8000/api'
    : 'https://ara-test1-ca0b96725df3.herokuapp.com/api',
  
  // API Endpoints
  ENDPOINTS: {
    AUTH_LOGIN: '/auth/login/',
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
    REFRESH_TOKEN_ENABLED: false,
  }
};

window.CONFIG = CONFIG;