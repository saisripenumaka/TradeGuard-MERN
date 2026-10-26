import API from './api';

const authService = {
  // Register user
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    if (response.data && response.data.token) {
      localStorage.setItem('tradeguard_token', response.data.token);
      localStorage.setItem('tradeguard_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    if (response.data && response.data.token) {
      localStorage.setItem('tradeguard_token', response.data.token);
      localStorage.setItem('tradeguard_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  // Get current user profile
  getMe: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await API.post('/auth/forgotpassword', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (resetToken, password) => {
    const response = await API.put(`/auth/resetpassword/${resetToken}`, { password });
    if (response.data && response.data.token) {
      localStorage.setItem('tradeguard_token', response.data.token);
      localStorage.setItem('tradeguard_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('tradeguard_token');
    localStorage.removeItem('tradeguard_user');
  },

  // Get current saved user from local storage
  getCurrentUser: () => {
    const savedUser = localStorage.getItem('tradeguard_user');
    return savedUser ? JSON.parse(savedUser) : null;
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('tradeguard_token');
  },
};

export default authService;
