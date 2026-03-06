import React, { createContext, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import authService from '@services/authService';
import { USER_KEY } from '@utils/constants';
import {
  getAccessToken,
  getStoredUser,
  clearTokens,
  decodeToken,
} from '@utils/tokenUtils';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from local storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = getAccessToken();
        const storedUser = getStoredUser();
        // Restore session if token is structurally valid (even if expired — it will be
        // refreshed on the first API call via the request interceptor in api.js)
        if (storedToken && storedUser && decodeToken(storedToken)) {
          setToken(storedToken);
          setUser(storedUser);
        } else {
          // Missing or corrupted session — clear everything
          clearTokens();
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setInitializing(false);
      }
    };
    initializeAuth();

    // Listen for forced logout from api.js (token refresh failed)
    const handleForcedLogout = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  const register = useCallback(async (email, password, confirmPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(email, password, confirmPassword);
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      const { access_token, user: userData } = response;
      // authService.login already called saveTokens() — just update React state
      setToken(access_token);
      setUser(userData);

      return response;
    } catch (err) {
      console.error('❌ AuthContext.login - Error:', err);
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    setError(null);
    try {
      await authService.logout(); // clears localStorage + removes refreshToken from db
    } catch {
      clearTokens(); // fallback if server is unreachable
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.updateProfile(updates);
      const updatedUser = response.data;
      setUser(updatedUser);
      // Store user via JSON.stringify so getStoredUser() (JSON.parse) can read it back
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword, confirmPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.changePassword(
        currentPassword,
        newPassword,
        confirmPassword
      );
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.requestPasswordReset(email);
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token, password, confirmPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.resetPassword(token, password, confirmPassword);
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    loading,
    initializing,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
