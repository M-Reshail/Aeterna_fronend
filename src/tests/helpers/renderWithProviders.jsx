/**
 * renderWithProviders — wraps a component in all required providers:
 *  • QueryClientProvider (fresh client per test, no retries)
 *  • AuthContext with controllable mock values
 *  • MemoryRouter (with optional initial entries)
 */
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '@contexts/AuthContext';

/** Default mock user — override per test as needed */
export const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  active: true,
  createdAt: '2024-01-01T00:00:00Z',
};

/** Default auth context values */
export const defaultAuthValues = {
  user: mockUser,
  token: 'fake-jwt-token',
  isAuthenticated: true,
  initializing: false,
  loading: false,
  error: null,
  login: jest.fn().mockResolvedValue({ access_token: 'fake-jwt-token', user: mockUser }),
  logout: jest.fn().mockResolvedValue(undefined),
  register: jest.fn().mockResolvedValue({ message: 'Registered' }),
  updateProfile: jest.fn().mockResolvedValue({ data: mockUser }),
  changePassword: jest.fn().mockResolvedValue({}),
};

/** Creates a fresh QueryClient with retries disabled to keep tests fast */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

/**
 * @param {React.ReactElement} ui - Component to render
 * @param {object} options
 * @param {string[]} [options.route] - Initial router entries, defaults to ['/']
 * @param {object} [options.authOverrides] - Override any AuthContext values
 * @param {QueryClient} [options.queryClient] - Custom query client
 */
export function renderWithProviders(ui, { route = ['/'], authOverrides = {}, queryClient } = {}) {
  const client = queryClient ?? createTestQueryClient();
  const authValue = { ...defaultAuthValues, ...authOverrides };

  function Wrapper({ children }) {
    return (
      <QueryClientProvider client={client}>
        <AuthContext.Provider value={authValue}>
          <MemoryRouter
            initialEntries={route}
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            {children}
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  }

  return { ...render(ui, { wrapper: Wrapper }), queryClient: client };
}

/** Render without authentication (public routes) */
export function renderPublic(ui, { route = ['/login'] } = {}) {
  return renderWithProviders(ui, {
    route,
    authOverrides: {
      user: null,
      token: null,
      isAuthenticated: false,
      initializing: false,
    },
  });
}

/** Render as admin user */
export function renderAsAdmin(ui, options = {}) {
  return renderWithProviders(ui, {
    ...options,
    authOverrides: {
      ...options.authOverrides,
      user: { ...mockUser, role: 'admin' },
    },
  });
}
