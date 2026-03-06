import api from './api';

export const userService = {
  // Get user preferences
  getPreferences: async () => {
    const response = await api.get('/api/users/preferences');
    return response.data;
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    const response = await api.patch('/api/users/preferences', preferences);
    return response.data;
  },

  // Get notification settings
  getNotificationSettings: async () => {
    const response = await api.get('/api/users/notification-settings');
    return response.data;
  },

  // Update notification settings
  updateNotificationSettings: async (settings) => {
    const response = await api.patch('/api/users/notification-settings', settings);
    return response.data;
  },

  // Add token to watchlist
  addToWatchlist: async (token) => {
    const response = await api.post('/api/users/watchlist', {
      token,
    });
    return response.data;
  },

  // Remove token from watchlist
  removeFromWatchlist: async (token) => {
    const response = await api.delete(`/api/users/watchlist/${token}`);
    return response.data;
  },

  // Get watchlist
  getWatchlist: async () => {
    const response = await api.get('/api/users/watchlist');
    return response.data;
  },

  // Update watchlist
  updateWatchlist: async (tokens) => {
    const response = await api.patch('/api/users/watchlist', {
      tokens,
    });
    return response.data;
  },

  // Link Telegram account
  linkTelegram: async (linkingCode) => {
    const response = await api.post('/api/users/telegram/link', {
      linking_code: linkingCode,
    });
    return response.data;
  },

  // Unlink Telegram account
  unlinkTelegram: async () => {
    const response = await api.delete('/api/users/telegram/unlink');
    return response.data;
  },

  // Get Telegram status
  getTelegramStatus: async () => {
    const response = await api.get('/api/users/telegram/status');
    return response.data;
  },

  // Set quiet hours
  setQuietHours: async (startTime, endTime) => {
    const response = await api.post('/api/users/quiet-hours', {
      start_time: startTime,
      end_time: endTime,
    });
    return response.data;
  },

  // Update alert frequency
  updateAlertFrequency: async (frequency) => {
    const response = await api.patch('/api/users/alert-frequency', {
      frequency,
    });
    return response.data;
  },

  // Set priority filter
  setPriorityFilter: async (priorities) => {
    const response = await api.patch('/api/users/priority-filter', {
      priorities,
    });
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await api.get('/api/users/stats');
    return response.data;
  },

  // Get activity log
  getActivityLog: async (page = 1, limit = 20) => {
    const response = await api.get('/api/users/activity-log', {
      params: { page, limit },
    });
    return response.data;
  },
};

export default userService;
