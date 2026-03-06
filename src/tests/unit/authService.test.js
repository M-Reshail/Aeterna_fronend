/**
 * Unit tests for src/services/authService.js
 *
 * All HTTP calls (via api / axios) are mocked.
 */
import { authService } from '@services/authService';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '@utils/constants';

// ─── Mock dependencies ────────────────────────────────────────────────────────
jest.mock('@services/api', () => ({
  __esModule: true,
  default: {
    get:    jest.fn(),
    post:   jest.fn(),
    patch:  jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: { patch: jest.fn().mockResolvedValue({}) },
}));

import api from '@services/api';

const mockUser = {
  id: 1,
  email: 'user@example.com',
  name: 'user',
  role: 'user',
  active: true,
  password: 'Pass@1',
  refreshToken: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

// ─── register ────────────────────────────────────────────────────────────────
describe('authService.register', () => {
  it('throws when passwords do not match', async () => {
    await expect(authService.register('a@b.com', 'Pass1', 'Pass2')).rejects.toThrow(
      'Passwords do not match'
    );
  });

  it('throws when user already exists', async () => {
    api.get.mockResolvedValue({ data: [mockUser] });
    await expect(authService.register('user@example.com', 'Pass@1', 'Pass@1')).rejects.toThrow(
      'User already exists'
    );
  });

  it('creates user and returns tokens when email is new', async () => {
    api.get.mockResolvedValue({ data: [] });
    const newUser = { ...mockUser, id: 2, email: 'new@example.com', name: 'new' };
    api.post.mockResolvedValue({ data: newUser });

    const result = await authService.register('new@example.com', 'Pass@1', 'Pass@1');
    expect(api.post).toHaveBeenCalledWith('/users', expect.objectContaining({ email: 'new@example.com' }));
    expect(result.access_token).toBeDefined();
    expect(result.user.email).toBe('new@example.com');
  });
});

// ─── login ───────────────────────────────────────────────────────────────────
describe('authService.login', () => {
  it('throws if user not found', async () => {
    api.get.mockResolvedValue({ data: [] });
    await expect(authService.login('nobody@example.com', 'Pass@1')).rejects.toThrow(
      'User not found'
    );
  });

  it('throws if password is wrong', async () => {
    api.get.mockResolvedValue({ data: [mockUser] });
    await expect(authService.login('user@example.com', 'WrongPass')).rejects.toThrow(
      'Invalid password'
    );
  });

  it('throws if account is disabled', async () => {
    api.get.mockResolvedValue({ data: [{ ...mockUser, active: false }] });
    await expect(authService.login('user@example.com', 'Pass@1')).rejects.toThrow(
      'This account is disabled'
    );
  });

  it('returns tokens and user for correct credentials', async () => {
    api.get.mockResolvedValue({ data: [mockUser] });

    const result = await authService.login('user@example.com', 'Pass@1');
    expect(result.access_token).toBeDefined();
    expect(result.refresh_token).toBeDefined();
    expect(result.user.email).toBe('user@example.com');
  });

  it('saves tokens to localStorage on success', async () => {
    api.get.mockResolvedValue({ data: [mockUser] });
    await authService.login('user@example.com', 'Pass@1');
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeTruthy();
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeTruthy();
  });
});

// ─── logout ───────────────────────────────────────────────────────────────────
describe('authService.logout', () => {
  it('clears tokens from localStorage', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'tok');
    localStorage.setItem(USER_KEY, JSON.stringify({ id: 1 }));

    await authService.logout();
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
  });

  it('completes without error even if user not in localStorage', async () => {
    await expect(authService.logout()).resolves.toBeUndefined();
  });
});

// ─── changePassword ──────────────────────────────────────────────────────────
describe('authService.changePassword', () => {
  beforeEach(() => {
    localStorage.setItem(USER_KEY, JSON.stringify({ id: 1 }));
  });

  it('throws if not authenticated', async () => {
    localStorage.removeItem(USER_KEY);
    await expect(authService.changePassword('old', 'new')).rejects.toThrow('Not authenticated');
  });

  it('throws if current password is wrong', async () => {
    api.get.mockResolvedValue({ data: { ...mockUser, password: 'correct' } });
    await expect(authService.changePassword('wrong', 'New@1')).rejects.toThrow(
      'Current password is incorrect'
    );
  });

  it('patches new password when current password is correct', async () => {
    api.get.mockResolvedValue({ data: { ...mockUser, password: 'correct' } });
    api.patch.mockResolvedValue({ data: {} });
    const result = await authService.changePassword('correct', 'NewPass@1');
    expect(api.patch).toHaveBeenCalled();
    expect(result.message).toMatch(/password changed/i);
  });
});
