/**
 * API Wrapper
 * Handles all HTTP requests with automatic token injection
 */
import { getAccessToken } from './auth.js';
const API = {
  
  /**
   * Make GET request
   */
  async get(endpoint) {
    return this.request('GET', endpoint);
  },

  /**
   * Make POST request
   */
  async post(endpoint, data) {
    return this.request('POST', endpoint, data);
  },

  /**
   * Make PUT request
   */
  async put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  },

  /**
   * Make PATCH request
   */
  async patch(endpoint, data) {
    return this.request('PATCH', endpoint, data);
  },

  /**
   * Make DELETE request
   */
  async delete(endpoint) {
    return this.request('DELETE', endpoint);
  },

  /**
   * Core request handler
   */
  async request(method, endpoint, data = null) {
    const url = CONFIG.API_BASE_URL + endpoint;
    const token = getAccessToken();

    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    // Add auth token if exists
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add request body if provided
    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        logout();
        throw new Error('Session expired. Please login again.');
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || 
          result.error || 
          `HTTP Error: ${response.status}`
        );
      }

      return result;
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }
};

window.API = API;