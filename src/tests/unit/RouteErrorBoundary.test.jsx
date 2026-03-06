import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RouteErrorBoundary from '@components/common/RouteErrorBoundary';

/** Component that always throws */
const Bomb = ({ shouldThrow = false }) => {
  if (shouldThrow) throw new Error('Test error: component crashed');
  return <div>Stable content</div>;
};

describe('RouteErrorBoundary', () => {
  // Suppress expected error output from error boundaries in tests
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    console.error.mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <MemoryRouter>
        <RouteErrorBoundary>
          <div>All good</div>
        </RouteErrorBoundary>
      </MemoryRouter>
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders fallback UI when a child throws', () => {
    render(
      <MemoryRouter>
        <RouteErrorBoundary>
          <Bomb shouldThrow />
        </RouteErrorBoundary>
      </MemoryRouter>
    );
    expect(screen.getByText(/page error/i)).toBeInTheDocument();
    expect(screen.getByText(/test error: component crashed/i)).toBeInTheDocument();
  });

  it('shows Retry and Error page buttons in fallback', () => {
    render(
      <MemoryRouter>
        <RouteErrorBoundary>
          <Bomb shouldThrow />
        </RouteErrorBoundary>
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /error page/i })).toBeInTheDocument();
  });

  it('resets the error state when Retry is clicked', async () => {
    const { rerender } = render(
      <MemoryRouter>
        <RouteErrorBoundary>
          <Bomb shouldThrow />
        </RouteErrorBoundary>
      </MemoryRouter>
    );

    // Verify error boundary triggered
    expect(screen.getByText(/page error/i)).toBeInTheDocument();

    // Rerender with a non-throwing child BEFORE clicking Retry so the boundary
    // doesn't immediately re-catch after reset
    rerender(
      <MemoryRouter>
        <RouteErrorBoundary>
          <Bomb shouldThrow={false} />
        </RouteErrorBoundary>
      </MemoryRouter>
    );

    // Click retry — resets hasError to false and renders the non-throwing child
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByText('Stable content')).toBeInTheDocument();
    });
  });
});
