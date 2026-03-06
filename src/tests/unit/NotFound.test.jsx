import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFound } from '@pages/NotFound';

const renderNotFound = () =>
  render(
    <MemoryRouter>
      <NotFound />
    </MemoryRouter>
  );

describe('NotFound page', () => {
  it('displays the 404 heading', () => {
    renderNotFound();
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('displays "Page not found" message', () => {
    renderNotFound();
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it('renders a home navigation link', () => {
    renderNotFound();
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
  });

  it('home link points to /', () => {
    renderNotFound();
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
  });

  it('renders a go back button', () => {
    renderNotFound();
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  it('calls window.history.back when go back is clicked', () => {
    const backSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});
    renderNotFound();
    fireEvent.click(screen.getByRole('button', { name: /go back/i }));
    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });
});
