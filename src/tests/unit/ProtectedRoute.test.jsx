import React from 'react';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from '@components/auth/ProtectedRoute';
import { renderWithProviders, renderPublic } from '@tests/helpers/renderWithProviders';

// Helper to render a route tree with ProtectedRoute
function renderProtected(authOverrides = {}, requiredRole = null) {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<div>Login page</div>} />
      <Route path="/dashboard" element={<div>Dashboard redirect</div>} />
      <Route
        path="/protected"
        element={
          <ProtectedRoute requiredRole={requiredRole}>
            <div>Protected content</div>
          </ProtectedRoute>
        }
      />
    </Routes>,
    { route: ['/protected'], authOverrides }
  );
}

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    renderProtected();
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    renderProtected({ isAuthenticated: false, user: null, token: null, initializing: false });
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('shows spinner while initializing', () => {
    renderProtected({ initializing: true });
    // Spinner is rendered — there should be no protected content yet
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('redirects to /dashboard when role does not match', () => {
    renderProtected({ user: { id: 1, email: 'u@u.com', role: 'user' } }, 'admin');
    expect(screen.getByText('Dashboard redirect')).toBeInTheDocument();
  });

  it('renders children when role matches', () => {
    renderProtected({ user: { id: 1, email: 'a@a.com', role: 'admin' } }, 'admin');
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });
});

describe('PublicRoute', () => {
  function renderPublicRoute(authOverrides = {}) {
    return renderWithProviders(
      <Routes>
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <div>Login page</div>
            </PublicRoute>
          }
        />
      </Routes>,
      { route: ['/login'], authOverrides }
    );
  }

  it('renders children when NOT authenticated', () => {
    renderPublicRoute({ isAuthenticated: false, user: null, token: null, initializing: false });
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('redirects to /dashboard when already authenticated', () => {
    renderPublicRoute();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
