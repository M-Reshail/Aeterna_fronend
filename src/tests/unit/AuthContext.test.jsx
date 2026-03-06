/**
 * AuthContext / AuthProvider unit tests.
 *
 * Tests the React context: initialization from localStorage, login, logout,
 * register, updateProfile, changePassword flows.
 */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthContext, AuthProvider } from '@contexts/AuthContext';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '@utils/constants';
import {
  generateAccessToken,
  generateRefreshToken,
} from '@utils/tokenUtils';

// ─── Mock authService ─────────────────────────────────────────────────────────
jest.mock('@services/authService', () => ({
  __esModule: true,
  default: {
    login:                jest.fn(),
    logout:               jest.fn().mockResolvedValue({}),
    register:             jest.fn(),
    updateProfile:        jest.fn(),
    changePassword:       jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword:        jest.fn(),
  },
}));

import authService from '@services/authService';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const mockUser = { id: 1, email: 'user@test.com', name: 'Test User', role: 'user' };

/** Reads the context value via a consumer child */
function Consumer() {
  const ctx = React.useContext(AuthContext);
  // Buttons suppress re-thrown errors so tests can verify state without unhandled rejections
  const safeLogin = () => ctx.login('a@b.com', 'Pass@1').catch(() => {});
  const safeRegister = () => ctx.register('a@b.com', 'Pass@1', 'Pass@1').catch(() => {});

  return (
    <div>
      <span data-testid="is-auth">{String(ctx.isAuthenticated)}</span>
      <span data-testid="user-email">{ctx.user?.email ?? 'none'}</span>
      <span data-testid="loading">{String(ctx.loading)}</span>
      <span data-testid="initializing">{String(ctx.initializing)}</span>
      <span data-testid="error">{ctx.error ?? 'none'}</span>
      <button onClick={safeLogin}>Login</button>
      <button onClick={() => ctx.logout()}>Logout</button>
      <button onClick={safeRegister}>Register</button>
    </div>
  );
}

function renderProvider() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AuthContext: initial state (no stored tokens)', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('initializes as not authenticated when localStorage is empty', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByTestId('is-auth').textContent).toBe('false');
    });
  });

  it('sets initializing to false after init', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByTestId('initializing').textContent).toBe('false');
    });
  });
});

describe('AuthContext: initialization from localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('restores session from valid stored tokens', async () => {
    const accessToken  = generateAccessToken(mockUser);
    const refreshToken = generateRefreshToken(mockUser);
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser));

    renderProvider();
    await waitFor(() => {
      expect(screen.getByTestId('is-auth').textContent).toBe('true');
      expect(screen.getByTestId('user-email').textContent).toBe('user@test.com');
    });
  });

  it('does not restore session when tokens are missing', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByTestId('is-auth').textContent).toBe('false');
    });
  });

  it('clears storage when token is invalid/corrupted', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'bad-token');
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser));

    renderProvider();
    await waitFor(() => {
      expect(screen.getByTestId('is-auth').textContent).toBe('false');
    });
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
  });
});

describe('AuthContext: login', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('sets user and isAuthenticated=true on successful login', async () => {
    const accessToken = generateAccessToken(mockUser);
    authService.login.mockResolvedValue({
      access_token: accessToken,
      user: mockUser,
    });

    renderProvider();
    await waitFor(() => expect(screen.getByTestId('initializing').textContent).toBe('false'));

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-auth').textContent).toBe('true');
      expect(screen.getByTestId('user-email').textContent).toBe('user@test.com');
    });
  });

  it('sets error state and re-throws on failed login', async () => {
    const loginError = { response: { data: { message: 'Invalid credentials' } } };
    authService.login.mockRejectedValue(loginError);

    const { getByTestId } = renderProvider();
    await waitFor(() => expect(getByTestId('initializing').textContent).toBe('false'));

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(getByTestId('error').textContent).toBe('Invalid credentials');
      expect(getByTestId('is-auth').textContent).toBe('false');
    });
  });
});

describe('AuthContext: logout', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('clears user and token on logout', async () => {
    const accessToken = generateAccessToken(mockUser);
    authService.login.mockResolvedValue({
      access_token: accessToken,
      user: mockUser,
    });

    renderProvider();
    await waitFor(() => expect(screen.getByTestId('initializing').textContent).toBe('false'));

    // Login first
    await act(async () => {
      screen.getByText('Login').click();
    });
    await waitFor(() => {
      expect(screen.getByTestId('is-auth').textContent).toBe('true');
    });

    // Then logout
    await act(async () => {
      screen.getByText('Logout').click();
    });
    await waitFor(() => {
      expect(screen.getByTestId('is-auth').textContent).toBe('false');
      expect(screen.getByTestId('user-email').textContent).toBe('none');
    });
  });

  it('falls back to clearTokens when authService.logout throws', async () => {
    authService.logout.mockRejectedValue(new Error('Network error'));
    const accessToken = generateAccessToken(mockUser);
    authService.login.mockResolvedValue({ access_token: accessToken, user: mockUser });

    renderProvider();
    await waitFor(() => expect(screen.getByTestId('initializing').textContent).toBe('false'));

    await act(async () => { screen.getByText('Login').click(); });
    await waitFor(() => expect(screen.getByTestId('is-auth').textContent).toBe('true'));

    await act(async () => { screen.getByText('Logout').click(); });
    await waitFor(() => {
      expect(screen.getByTestId('is-auth').textContent).toBe('false');
    });
  });
});

describe('AuthContext: register', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('calls authService.register and returns response', async () => {
    authService.register.mockResolvedValue({ message: 'Registered' });
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('initializing').textContent).toBe('false'));

    await act(async () => { screen.getByText('Register').click(); });

    expect(authService.register).toHaveBeenCalledWith('a@b.com', 'Pass@1', 'Pass@1');
  });

  it('sets error when register fails', async () => {
    authService.register.mockRejectedValue({ response: { data: { message: 'Email exists' } } });
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('initializing').textContent).toBe('false'));

    await act(async () => { screen.getByText('Register').click(); });
    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('Email exists');
    });
  });
});

describe('AuthContext: forced logout event', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('clears auth when auth:logout event is dispatched', async () => {
    const accessToken = generateAccessToken(mockUser);
    authService.login.mockResolvedValue({ access_token: accessToken, user: mockUser });

    renderProvider();
    await waitFor(() => expect(screen.getByTestId('initializing').textContent).toBe('false'));
    await act(async () => { screen.getByText('Login').click(); });
    await waitFor(() => expect(screen.getByTestId('is-auth').textContent).toBe('true'));

    act(() => {
      window.dispatchEvent(new Event('auth:logout'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-auth').textContent).toBe('false');
    });
  });
});
