import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login } from '@pages/Login';
import { renderPublic, renderWithProviders } from '@tests/helpers/renderWithProviders';

// Mock useNavigate to capture redirects
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login — authentication flow', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  // ─── Render ────────────────────────────────────────────────────────────────

  it('renders the login form with email and password fields', () => {
    renderPublic(<Login />);
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('renders a submit button', () => {
    renderPublic(<Login />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders a link to the register page', () => {
    renderPublic(<Login />);
    expect(screen.getByRole('link', { name: /register|sign up|create/i })).toBeInTheDocument();
  });

  // ─── Validation ────────────────────────────────────────────────────────────

  it('shows validation error when submitting empty form', async () => {
    renderPublic(<Login />);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('shows error for invalid email format', async () => {
    renderPublic(<Login />);
    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), 'not-valid');
    fireEvent.blur(screen.getByPlaceholderText(/you@example.com/i));
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it('shows error when password is missing', async () => {
    renderPublic(<Login />);
    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), 'user@example.com');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  // ─── Successful login ──────────────────────────────────────────────────────

  it('calls login() with correct credentials and navigates to /dashboard on success', async () => {
    const loginMock = jest.fn().mockResolvedValue({
      access_token: 'fake-token',
      user: { id: 1, email: 'user@example.com', role: 'user' },
    });

    renderWithProviders(<Login />, {
      authOverrides: { isAuthenticated: false, user: null, token: null, login: loginMock },
      route: ['/login'],
    });

    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), 'user@example.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Password@1');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('user@example.com', 'Password@1');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  // ─── Failed login ──────────────────────────────────────────────────────────

  it('displays server error message when login fails', async () => {
    const loginMock = jest.fn().mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    });

    renderWithProviders(<Login />, {
      authOverrides: { isAuthenticated: false, user: null, token: null, login: loginMock },
      route: ['/login'],
    });

    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), 'user@example.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'WrongPass@1');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  // ─── Show/hide password ────────────────────────────────────────────────────

  it('toggles password visibility when the eye icon is clicked', async () => {
    renderPublic(<Login />);
    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toHaveAttribute('type', 'password');

    // The toggle button now has an aria-label (show/hide password)
    const toggleBtn = screen.getByRole('button', { name: /show password/i });
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
