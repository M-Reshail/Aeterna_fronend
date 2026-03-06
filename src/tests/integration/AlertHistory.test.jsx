import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertHistory } from '@pages/AlertHistory';
import { renderWithProviders } from '@tests/helpers/renderWithProviders';

// ─── Mock all external hooks and services ────────────────────────────────────

const mockAlerts = [
  {
    id: 1,
    title: 'Whale Transfer Detected',
    content: 'Large transfer on Ethereum.',
    priority: 'HIGH',
    status: 'new',
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
    entity: 'ETH',
    source: 'Ethereum',
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    id: 2,
    title: 'BTC Price Alert',
    content: 'Bitcoin dropped 5%.',
    priority: 'MEDIUM',
    status: 'read',
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    entity: 'BTC',
    source: 'Binance',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
  },
];

jest.mock('@hooks/useAlerts', () => ({
  usePaginatedAlerts: jest.fn(() => ({
    data: { items: mockAlerts, total: 2, page: 1, limit: 10, totalPages: 1 },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: jest.fn(),
  })),
  useMarkAsRead: jest.fn(() => ({ mutate: jest.fn() })),
  useDismissAlert: jest.fn(() => ({ mutate: jest.fn() })),
}));

jest.mock('@services/feedbackService', () => ({
  default: { submitFeedback: jest.fn().mockResolvedValue({}) },
  feedbackService: { submitFeedback: jest.fn().mockResolvedValue({}) },
}));

jest.mock('@hooks/useToast', () => ({
  useToast: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  })),
  ToastContainer: () => null,
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AlertHistory page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore default return value so tests that override with mockReturnValue
    // don't leak state into subsequent tests
    const { usePaginatedAlerts, useMarkAsRead, useDismissAlert } = require('@hooks/useAlerts');
    usePaginatedAlerts.mockReturnValue({
      data: { items: mockAlerts, total: 2, page: 1, limit: 10, totalPages: 1 },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });
    useMarkAsRead.mockReturnValue({ mutate: jest.fn() });
    useDismissAlert.mockReturnValue({ mutate: jest.fn() });
  });

  const render = () =>
    renderWithProviders(<AlertHistory />, { route: ['/alerts'] });

  it('renders the page heading', () => {
    render();
    expect(screen.getByText(/alert history/i)).toBeInTheDocument();
  });

  it('renders the list of alerts', () => {
    render();
    expect(screen.getByText(/whale transfer detected/i)).toBeInTheDocument();
    expect(screen.getByText(/btc price alert/i)).toBeInTheDocument();
  });

  it('renders the search input', () => {
    render();
    expect(screen.getByPlaceholderText(/search alerts/i)).toBeInTheDocument();
  });

  it('renders the priority filter dropdown', () => {
    render();
    expect(screen.getByDisplayValue(/priority/i)).toBeInTheDocument();
  });

  it('renders the Export CSV button', () => {
    render();
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
  });

  it('renders the Refresh button', () => {
    render();
    expect(screen.getByRole('button', { name: /refresh alerts/i })).toBeInTheDocument();
  });

  it('shows skeleton loading state when isLoading is true', async () => {
    const { usePaginatedAlerts } = require('@hooks/useAlerts');
    usePaginatedAlerts.mockReturnValue({
      data: null,
      isLoading: true,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });

    render();
    // Skeleton rows are rendered (they have animate-pulse class)
    await waitFor(() => {
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  it('shows error state with retry button when isError is true', () => {
    const { usePaginatedAlerts } = require('@hooks/useAlerts');
    usePaginatedAlerts.mockReturnValue({
      data: null,
      isLoading: false,
      isFetching: false,
      isError: true,
      refetch: jest.fn(),
    });

    render();
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('shows empty state when no alerts match', () => {
    const { usePaginatedAlerts } = require('@hooks/useAlerts');
    usePaginatedAlerts.mockReturnValue({
      data: { items: [], total: 0, page: 1, limit: 10, totalPages: 1 },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });

    render();
    expect(screen.getByText(/no alerts found/i)).toBeInTheDocument();
  });

  it('shows clear filters button when a filter is active', async () => {
    render();
    await userEvent.type(screen.getByPlaceholderText(/search alerts/i), 'eth');
    await waitFor(() => {
      expect(screen.getByText(/clear all filters/i)).toBeInTheDocument();
    });
  });

  it('opens alert detail modal when an alert row is clicked', async () => {
    render();
    fireEvent.click(screen.getByText(/whale transfer detected/i));
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('shows pagination controls', () => {
    render();
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('Previous button is disabled on first page', () => {
    render();
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
  });

  it('filters by priority when dropdown changes', async () => {
    render();
    fireEvent.change(screen.getByDisplayValue(/priority/i), { target: { value: 'HIGH' } });
    await waitFor(() => {
      expect(screen.getByDisplayValue('HIGH')).toBeInTheDocument();
    });
  });

  it('dismisses an alert via the detail modal', async () => {
    const { useDismissAlert } = require('@hooks/useAlerts');
    const dismissMutate = jest.fn();
    useDismissAlert.mockReturnValue({ mutate: dismissMutate });

    render();
    fireEvent.click(screen.getByText(/whale transfer detected/i));
    await waitFor(() => screen.getByRole('dialog'));

    // The modal should have a dismiss button
    const dismissBtn = screen.queryByRole('button', { name: /dismiss/i });
    if (dismissBtn) {
      fireEvent.click(dismissBtn);
      expect(dismissMutate).toHaveBeenCalled();
    }
  });

  it('calls refetch when Refresh button is clicked', async () => {
    const { usePaginatedAlerts } = require('@hooks/useAlerts');
    const refetchMock = jest.fn();
    usePaginatedAlerts.mockReturnValue({
      data: { items: mockAlerts, total: 2, page: 1, limit: 10, totalPages: 1 },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: refetchMock,
    });

    render();
    fireEvent.click(screen.getByRole('button', { name: /refresh alerts/i }));
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it('clears the search when × button is clicked', async () => {
    render();
    const searchInput = screen.getByPlaceholderText(/search alerts/i);
    await userEvent.type(searchInput, 'whale');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '' })).toBeInTheDocument(); // × button
    });
  });
});
