/**
 * Authentication Service for Haxudio Admin
 * Communicates with the Express.js Backend API
 */

const TOKEN_KEY = 'haxudio_admin_token';
const ADMIN_KEY = 'haxudio_admin_user';

export const authService = {
  /**
   * Login administrator
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Login failed. Please check your credentials.');
    }

    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
    if (data.admin) {
      localStorage.setItem(ADMIN_KEY, JSON.stringify(data.admin));
    }

    return data;
  },

  /**
   * Fetch current authenticated admin profile
   */
  async getMe() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.logout();
        }
        return null;
      }

      const data = await response.json();
      if (data.success && data.admin) {
        localStorage.setItem(ADMIN_KEY, JSON.stringify(data.admin));
        return data.admin;
      }
      return null;
    } catch (err) {
      console.error('[AuthService] Error fetching profile:', err);
      return null;
    }
  },

  /**
   * Logout administrator
   */
  async logout() {
    const token = this.getToken();
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }).catch(() => {});
      }
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ADMIN_KEY);
    }
  },

  /**
   * Get JWT token from storage
   */
  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  /**
   * Get cached admin object from storage
   */
  getStoredAdmin() {
    try {
      const raw = localStorage.getItem(ADMIN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Quick synchronous check if token exists
   */
  isAuthenticated() {
    return Boolean(this.getToken());
  },
};
