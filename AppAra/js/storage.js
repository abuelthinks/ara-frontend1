/**
 * Storage Utilities
 * Wrapper around localStorage for convenience
 */

const Storage = {
  /**
   * Set value in localStorage
   */
  set(key, value) {
    try {
      const serialized = 
        typeof value === 'string' 
          ? value 
          : JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (e) {
      console.error('Storage.set error:', e);
      return false;
    }
  },

  /**
   * Get value from localStorage
   */
  get(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      return localStorage.getItem(key);
    }
  },

  /**
   * Remove value from localStorage
   */
  remove(key) {
    localStorage.removeItem(key);
  },

  /**
   * Clear all localStorage
   */
  clear() {
    localStorage.clear();
  }
};

window.Storage = Storage;