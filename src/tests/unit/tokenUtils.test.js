/**
 * Unit tests for src/utils/tokenUtils.js
 *
 * Covers: generateAccessToken, generateRefreshToken, decodeToken,
 * isTokenExpired, isTokenValid, saveTokens, clearTokens,
 * getAccessToken, getRefreshToken, getStoredUser
 */
import {
  generateAccessToken,
  generateRefreshToken,
  decodeToken,
  isTokenExpired,
  isTokenValid,
  saveTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
} from '@utils/tokenUtils';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '@utils/constants';

const mockUser = {
  id: 42,
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
};

// ─── generateAccessToken ──────────────────────────────────────────────────────
describe('generateAccessToken', () => {
  it('returns a non-empty base64 string', () => {
    const token = generateAccessToken(mockUser);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('encodes user id and email in the payload', () => {
    const token  = generateAccessToken(mockUser);
    const decoded = decodeToken(token);
    expect(decoded.id).toBe(mockUser.id);
    expect(decoded.email).toBe(mockUser.email);
    expect(decoded.type).toBe('access');
  });

  it('sets an exp in the future', () => {
    const token  = generateAccessToken(mockUser);
    const decoded = decodeToken(token);
    expect(decoded.exp).toBeGreaterThan(Date.now());
  });
});

// ─── generateRefreshToken ─────────────────────────────────────────────────────
describe('generateRefreshToken', () => {
  it('returns a non-empty string', () => {
    const token = generateRefreshToken(mockUser);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('encodes type=refresh', () => {
    const token  = generateRefreshToken(mockUser);
    const decoded = decodeToken(token);
    expect(decoded.type).toBe('refresh');
  });

  it('has a longer expiry than access token', () => {
    const access  = decodeToken(generateAccessToken(mockUser));
    const refresh = decodeToken(generateRefreshToken(mockUser));
    expect(refresh.exp).toBeGreaterThan(access.exp);
  });
});

// ─── decodeToken ──────────────────────────────────────────────────────────────
describe('decodeToken', () => {
  it('returns null for null input', () => {
    expect(decodeToken(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(decodeToken(undefined)).toBeNull();
  });

  it('returns null for an invalid base64 string', () => {
    expect(decodeToken('!!!not-base64!!!')).toBeNull();
  });

  it('returns the decoded payload for a valid token', () => {
    const token   = generateAccessToken(mockUser);
    const decoded = decodeToken(token);
    expect(decoded).toMatchObject({ id: mockUser.id, email: mockUser.email });
  });
});

// ─── isTokenExpired ───────────────────────────────────────────────────────────
describe('isTokenExpired', () => {
  it('returns true for null', () => {
    expect(isTokenExpired(null)).toBe(true);
  });

  it('returns true for an invalid token', () => {
    expect(isTokenExpired('bad')).toBe(true);
  });

  it('returns false for a freshly generated access token', () => {
    const token = generateAccessToken(mockUser);
    expect(isTokenExpired(token)).toBe(false);
  });

  it('returns true for a token with exp in the past', () => {
    const payload = { id: 1, exp: Date.now() - 1000 };
    const token   = btoa(JSON.stringify(payload));
    expect(isTokenExpired(token)).toBe(true);
  });
});

// ─── isTokenValid ─────────────────────────────────────────────────────────────
describe('isTokenValid', () => {
  it('returns false for null', () => {
    expect(isTokenValid(null)).toBe(false);
  });

  it('returns false for garbage input', () => {
    expect(isTokenValid('garbage')).toBe(false);
  });

  it('returns true for a freshly generated token', () => {
    const token = generateAccessToken(mockUser);
    expect(isTokenValid(token)).toBe(true);
  });

  it('returns false for expired token', () => {
    const payload = { id: 1, exp: Date.now() - 1000 };
    const token   = btoa(JSON.stringify(payload));
    expect(isTokenValid(token)).toBe(false);
  });
});

// ─── saveTokens / getAccessToken / getRefreshToken / getStoredUser ─────────────
describe('saveTokens and getters', () => {
  beforeEach(() => localStorage.clear());

  it('saveTokens persists access token', () => {
    const at = generateAccessToken(mockUser);
    const rt = generateRefreshToken(mockUser);
    saveTokens(at, rt, mockUser);
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe(at);
  });

  it('saveTokens persists refresh token', () => {
    const at = generateAccessToken(mockUser);
    const rt = generateRefreshToken(mockUser);
    saveTokens(at, rt, mockUser);
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe(rt);
  });

  it('saveTokens persists user JSON', () => {
    const at = generateAccessToken(mockUser);
    const rt = generateRefreshToken(mockUser);
    saveTokens(at, rt, mockUser);
    expect(JSON.parse(localStorage.getItem(USER_KEY))).toMatchObject({ id: mockUser.id });
  });

  it('getAccessToken returns stored token', () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'tok123');
    expect(getAccessToken()).toBe('tok123');
  });

  it('getRefreshToken returns stored token', () => {
    localStorage.setItem(REFRESH_TOKEN_KEY, 'ref456');
    expect(getRefreshToken()).toBe('ref456');
  });

  it('getStoredUser returns parsed user object', () => {
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
    expect(getStoredUser()).toMatchObject({ id: mockUser.id });
  });

  it('getStoredUser returns null when nothing stored', () => {
    expect(getStoredUser()).toBeNull();
  });

  it('getStoredUser returns null for invalid JSON', () => {
    localStorage.setItem(USER_KEY, 'not-json{{{');
    expect(getStoredUser()).toBeNull();
  });
});

// ─── clearTokens ─────────────────────────────────────────────────────────────
describe('clearTokens', () => {
  it('removes all token keys from localStorage', () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'a');
    localStorage.setItem(REFRESH_TOKEN_KEY, 'b');
    localStorage.setItem(USER_KEY, '{}');
    clearTokens();
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });
});
