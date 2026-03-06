import axios from 'axios';
import api from './api';
import { API_BASE_URL } from '@utils/constants';
import {
  generateAccessToken,
  generateRefreshToken,
  clearTokens,
  saveTokens,
} from '@utils/tokenUtils';

export const authService = {
  // ─── Register ──────────────────────────────────────────────────────────────
  register: async (email, password, confirmPassword) => {
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Check if user already exists
    const existing = await api.get('/users?email=' + email);
    if (existing.data.length > 0) {
      throw new Error('User already exists');
    }

    // Create new user in json-server
    const newUser = {
      email,
      password,
      name:         email.split('@')[0],
      role:         'user',
      active:       true,
      createdAt:    new Date().toISOString(),
      verified:     true,
      refreshToken: null,
    };

    const createResponse = await api.post('/users', newUser);
    const user = createResponse.data;

    return {
      access_token:  generateAccessToken(user),
      refresh_token: generateRefreshToken(user),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        active: user.active !== false,
      },
    };
  },

  // ─── Login ─────────────────────────────────────────────────────────────────
  login: async (email, password) => {
    const response = await api.get('/users?email=' + email);

    if (response.data.length === 0) {
      throw new Error('User not found');
    }

    const user = response.data[0];

    if (user.password !== password) {
      throw new Error('Invalid password');
    }

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Persist refresh token in json-server so the api.js refresh logic can verify it
    await axios.patch(`${API_BASE_URL}/users/${user.id}`, { refreshToken });

    if (user.active === false) {
      throw new Error('This account is disabled');
    }

    // Save both tokens + user info to localStorage
    saveTokens(accessToken, refreshToken, {
      id:    user.id,
      email: user.email,
      name:  user.name,
      role:  user.role || 'user',
      active: user.active !== false,
    });

    return {
      access_token:  accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        active: user.active !== false,
      },
    };
  },

  // ─── Logout ────────────────────────────────────────────────────────────────
  logout: async () => {
    try {
      const stored = JSON.parse(localStorage.getItem('user'));
      if (stored?.id) {
        // Clear refresh token from db so it can't be reused
        await axios.patch(`${API_BASE_URL}/users/${stored.id}`, {
          refreshToken: null,
        });
      }
    } catch {
      // Ignore errors on logout cleanup
    } finally {
      clearTokens();
    }
  },

  // ─── Get current user profile from db ─────────────────────────────────────
  getProfile: async () => {
    const stored = JSON.parse(localStorage.getItem('user'));
    if (!stored?.id) throw new Error('Not authenticated');
    const response = await api.get(`/users/${stored.id}`);
    const { password: _, refreshToken: __, ...safeUser } = response.data;
    return safeUser;
  },

  // ─── Update profile ────────────────────────────────────────────────────────
  updateProfile: async (data) => {
    const stored = JSON.parse(localStorage.getItem('user'));
    if (!stored?.id) throw new Error('Not authenticated');
    const response = await api.patch(`/users/${stored.id}`, data);
    return response.data;
  },

  // ─── Change password ───────────────────────────────────────────────────────
  changePassword: async (currentPassword, newPassword) => {
    const stored = JSON.parse(localStorage.getItem('user'));
    if (!stored?.id) throw new Error('Not authenticated');

    const userRes = await api.get(`/users/${stored.id}`);
    if (userRes.data.password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }

    await api.patch(`/users/${stored.id}`, { password: newPassword });
    return { message: 'Password changed successfully' };
  },
};

export default authService;

