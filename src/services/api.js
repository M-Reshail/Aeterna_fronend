import axios from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT } from '@utils/constants';
import {
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  decodeToken,
  generateAccessToken,
  clearTokens,
  saveTokens,
} from '@utils/tokenUtils';

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Retry Logic ──────────────────────────────────────────────────────────────
const RETRYABLE_STATUSES = [408, 429, 500, 502, 503, 504];
const MAX_RETRIES    = 3;
const RETRY_DELAY_MS = 1000; // doubles each attempt: 1s, 2s, 4s

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let activeRequests = 0;

const emitNetworkLoading = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('app:network-loading', {
        detail: { loading: activeRequests > 0, count: activeRequests },
      })
    );
  }
};

const startNetworkRequest = () => {
  activeRequests += 1;
  emitNetworkLoading();
};

const finishNetworkRequest = () => {
  activeRequests = Math.max(0, activeRequests - 1);
  emitNetworkLoading();
};

const shouldRetry = (error, attempt) => {
  if (attempt >= MAX_RETRIES) return false;
  if (!error.response) return true; // Network error - always retry
  return RETRYABLE_STATUSES.includes(error.response.status);
};

// ─── Token Refresh State ──────────────────────────────────────────────────────
let isRefreshing  = false;
let refreshQueue  = []; // requests waiting for new token

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  refreshQueue = [];
};

// Refresh access token using refresh token + json-server user lookup
const doRefresh = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken || isTokenExpired(refreshToken)) {
    throw new Error('Refresh token expired');
  }

  const decoded = decodeToken(refreshToken);
  // Verify user still exists in json-server and refresh token matches
  const res = await axios.get(`${API_BASE_URL}/users/${decoded.id}`);
  const user = res.data;

  if (user.refreshToken !== refreshToken) {
    throw new Error('Refresh token mismatch');
  }

  const newAccessToken = generateAccessToken(user);
  // Update only accessToken in localStorage, keep refreshToken same
  saveTokens(newAccessToken, refreshToken, {
    id:    user.id,
    email: user.email,
    name:  user.name,
  });

  return newAccessToken;
};

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    startNetworkRequest();
    let token = getAccessToken();

    if (token && isTokenExpired(token)) {
      // Proactively refresh before the request is sent
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          token = await doRefresh();
          processQueue(null, token);
        } catch (err) {
          processQueue(err, null);
          clearTokens();
          finishNetworkRequest();
          // Soft redirect — let React Router handle it on next render
          if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:logout'));
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Another refresh is in progress - queue this request
        token = await new Promise((resolve, reject) =>
          refreshQueue.push({ resolve, reject })
        );
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach retry counter
    config._retryCount = config._retryCount ?? 0;
    return config;
  },
  (error) => {
    finishNetworkRequest();
    return Promise.reject(error);
  }
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    finishNetworkRequest();
    return response;
  },
  async (error) => {
    finishNetworkRequest();
    const config = error.config;

    // ── 401: token expired mid-flight (server rejected it) ────────────────
    if (error.response?.status === 401 && !config._retry) {
      config._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await doRefresh();
          processQueue(null, newToken);
          config.headers.Authorization = `Bearer ${newToken}`;
          return api(config);
        } catch (refreshError) {
          processQueue(refreshError, null);
          clearTokens();
          if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:logout'));
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Wait for ongoing refresh then retry
      const newToken = await new Promise((resolve, reject) =>
        refreshQueue.push({ resolve, reject })
      );
      config.headers.Authorization = `Bearer ${newToken}`;
      return api(config);
    }

    // ── Retry transient errors ────────────────────────────────────────────
    if (shouldRetry(error, config._retryCount)) {
      config._retryCount += 1;
      const delay = RETRY_DELAY_MS * 2 ** (config._retryCount - 1);
      console.warn(
        `[API] Attempt ${config._retryCount}/${MAX_RETRIES} failed for ${config.url}. Retrying in ${delay}ms...`
      );
      await wait(delay);
      return api(config);
    }

    // ── Friendly error messages ───────────────────────────────────────────
    if (!error.response) {
      error.message = 'Network error. Make sure json-server is running: npm run dev:all';
    } else {
      const messages = {
        400: 'Invalid request data',
        403: 'You do not have permission to access this resource',
        404: 'Resource not found',
        408: 'Request timed out. Please try again',
        429: 'Too many requests. Please slow down',
        500: 'Server error. Please try again later',
      };
      error.message =
        messages[error.response.status] ||
        error.response?.data?.message ||
        `Unexpected error (${error.response.status})`;
    }

    return Promise.reject(error);
  }
);

export default api;

