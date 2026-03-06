import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from './constants';

// ─── Token Durations ───────────────────────────────────────────────────────────
const ACCESS_TOKEN_TTL  = 15 * 60 * 1000;        // 15 minutes
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─── Generate ─────────────────────────────────────────────────────────────────

export const generateAccessToken = (user) => {
  const payload = {
    id:    user.id,
    email: user.email,
    name:  user.name,
    type:  'access',
    iat:   Date.now(),
    exp:   Date.now() + ACCESS_TOKEN_TTL,
  };
  return btoa(JSON.stringify(payload));
};

export const generateRefreshToken = (user) => {
  const payload = {
    id:    user.id,
    email: user.email,
    type:  'refresh',
    iat:   Date.now(),
    exp:   Date.now() + REFRESH_TOKEN_TTL,
  };
  return btoa(JSON.stringify(payload));
};

// ─── Decode ───────────────────────────────────────────────────────────────────

export const decodeToken = (token) => {
  if (!token) return null;
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
};

// ─── Validation ───────────────────────────────────────────────────────────────

export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return Date.now() > decoded.exp;
};

export const isTokenValid = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return false;
  if (Date.now() > decoded.exp) return false;
  return true;
};

// ─── Storage helpers ──────────────────────────────────────────────────────────

export const saveTokens = (accessToken, refreshToken, user) => {
  localStorage.setItem(ACCESS_TOKEN_KEY,  accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getAccessToken  = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const getStoredUser   = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};
