import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings } from '@pages/Settings';
import { renderWithProviders } from '@tests/helpers/renderWithProviders';

// ─── Mock external dependencies ───────────────────────────────────────────────

jest.mock('@services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: [] }),
    post: jest.fn().mockResolvedValue({ data: { id: 1 } }),
    patch: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('@services/authService', () => ({
  __esModule: true,
  default: {
    changePassword: jest.fn().mockResolvedValue({}),
    logout: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('@hooks/useToast', () => ({
  useToast: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  })),
  ToastContainer: () => null,
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

// Helper: render Settings and wait for loading spinner to disappear
async function renderSettings() {
  const utils = renderWithProviders(<Settings />, { route: ['/settings'] });
  // loadSettings() sets loading=true then false after api.get resolves
  await waitFor(() => {
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  }, { timeout: 3000 });
  return utils;
}

describe('Settings page', () => {
  let api;
  let authServiceMock;

  beforeEach(() => {
    jest.clearAllMocks();
    api = require('@services/api').default;
    authServiceMock = require('@services/authService').default;
    api.get.mockResolvedValue({ data: [] });
    api.post.mockResolvedValue({ data: { id: 1 } });
    api.patch.mockResolvedValue({ data: {} });
    api.delete.mockResolvedValue({});
    authServiceMock.changePassword.mockResolvedValue({});
    authServiceMock.logout.mockResolvedValue({});
  });

  // ─── Tab navigation ─────────────────────────────────────────────────────────

  it('renders Account, Notifications, and Preferences tabs', async () => {
    await renderSettings();
    expect(screen.getByRole('button', { name: /^account$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^notifications$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^preferences$/i })).toBeInTheDocument();
  });

  it('shows Account tab content by default', async () => {
    await renderSettings();
    expect(screen.getByRole('heading', { name: /email address/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
  });

  it('switches to Notifications tab when clicked', async () => {
    await renderSettings();
    fireEvent.click(screen.getByRole('button', { name: /^notifications$/i }));
    await waitFor(() => {
      expect(screen.getByText(/notification channels/i)).toBeInTheDocument();
    });
  });

  it('switches to Preferences tab when clicked', async () => {
    await renderSettings();
    fireEvent.click(screen.getByRole('button', { name: /^preferences$/i }));
    await waitFor(() => {
      expect(screen.getByText(/watchlist|alert preferences/i)).toBeInTheDocument();
    });
  });

  // ─── Account — password validation ─────────────────────────────────────────

  it('shows password mismatch error when new and confirm passwords differ', async () => {
    await renderSettings();
    await userEvent.type(screen.getByPlaceholderText(/current password/i), 'OldPass@1');
    await userEvent.type(screen.getByPlaceholderText(/^enter new password/i), 'NewPass@1');
    await userEvent.type(screen.getByPlaceholderText(/confirm new password/i), 'Different@1');
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('shows error when current password is blank on submit', async () => {
    await renderSettings();
    await userEvent.type(screen.getByPlaceholderText(/^enter new password/i), 'NewPass@1');
    await userEvent.type(screen.getByPlaceholderText(/confirm new password/i), 'NewPass@1');
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    await waitFor(() => {
      expect(screen.getByText(/current password is required/i)).toBeInTheDocument();
    });
  });

  it('shows error when new password is too weak', async () => {
    await renderSettings();
    await userEvent.type(screen.getByPlaceholderText(/current password/i), 'OldPass@1');
    await userEvent.type(screen.getByPlaceholderText(/^enter new password/i), 'weak');
    await userEvent.type(screen.getByPlaceholderText(/confirm new password/i), 'weak');
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    await waitFor(() => {
      expect(screen.getByText(/minimum 8 characters|uppercase|lowercase|number/i)).toBeInTheDocument();
    });
  });

  // ─── Danger zone ────────────────────────────────────────────────────────────

  it('shows Delete Account button in the danger zone', async () => {
    await renderSettings();
    expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument();
  });

  it('shows delete confirmation modal when Delete Account is clicked', async () => {
    await renderSettings();
    fireEvent.click(screen.getByRole('button', { name: /delete account/i }));
    await waitFor(() => {
      expect(screen.getByText(/confirm account deletion|type delete/i)).toBeInTheDocument();
    });
  });

  it('does not delete account if confirmation text is wrong', async () => {
    await renderSettings();
    fireEvent.click(screen.getByRole('button', { name: /delete account/i }));
    await waitFor(() => screen.getByText(/confirm account deletion|type delete/i));

    const input = screen.getByPlaceholderText(/delete/i);
    await userEvent.type(input, 'wrong');
    fireEvent.click(screen.getByRole('button', { name: /delete forever/i }));

    // API delete should NOT have been called
    expect(api.delete).not.toHaveBeenCalled();
  });

  // ─── Notifications tab ──────────────────────────────────────────────────────

  it('saves notification settings successfully', async () => {
    await renderSettings();
    fireEvent.click(screen.getByRole('button', { name: /^notifications$/i }));
    await waitFor(() => screen.getByText(/notification channels/i));

    fireEvent.click(screen.getByRole('button', { name: /save notification settings/i }));
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/preferences', expect.any(Object));
    });
  });

  // ─── Preferences tab — watchlist ─────────────────────────────────────────────

  it('adds a token to the watchlist', async () => {
    await renderSettings();
    fireEvent.click(screen.getByRole('button', { name: /^preferences$/i }));
    await waitFor(() => screen.getByText(/watchlist|alert preferences/i));

    const input = screen.getByPlaceholderText(/BTC, ETH/i);
    await userEvent.type(input, 'BTC');
    fireEvent.click(screen.getByRole('button', { name: /Add/i }));

    await waitFor(() => {
      expect(screen.getByText('BTC')).toBeInTheDocument();
    });
  });

  it('shows error when adding an invalid token symbol', async () => {
    await renderSettings();
    fireEvent.click(screen.getByRole('button', { name: /^preferences$/i }));
    await waitFor(() => screen.getByText(/watchlist|alert preferences/i));

    const input = screen.getByPlaceholderText(/BTC, ETH/i);
    await userEvent.type(input, 'invalid-symbol!!!');
    fireEvent.click(screen.getByRole('button', { name: /Add/i }));

    await waitFor(() => {
      expect(screen.getByText(/uppercase letters|2-10/i)).toBeInTheDocument();
    });
  });

  // ─── Password change success path ────────────────────────────────────────────

  it('calls changePassword on successful form submit', async () => {
    await renderSettings();
    await userEvent.type(screen.getByPlaceholderText(/current password/i), 'CurrPass@1');
    await userEvent.type(screen.getByPlaceholderText(/^enter new password/i), 'NewPass@1');
    await userEvent.type(screen.getByPlaceholderText(/confirm new password/i), 'NewPass@1');
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(authServiceMock.changePassword).toHaveBeenCalledWith('CurrPass@1', 'NewPass@1');
    });
  });
});
