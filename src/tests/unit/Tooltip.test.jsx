/**
 * Unit tests for src/components/common/Tooltip.jsx
 *
 * Tests visibility on mouse/focus events, placement, disabled state,
 * and absence of tooltip when content is empty.
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Tooltip } from '@components/common/Tooltip';

// Use fake timers so we can control the delay
beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('Tooltip', () => {
  // ─── No content ────────────────────────────────────────────────────────────
  it('renders children without tooltip when content is empty', () => {
    render(
      <Tooltip content="">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('renders children directly when content is not provided', () => {
    render(
      <Tooltip>
        <button>Btn</button>
      </Tooltip>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  // ─── Visibility on hover ──────────────────────────────────────────────────
  it('shows tooltip after mouseEnter and delay', async () => {
    render(
      <Tooltip content="Helpful text" delay={100}>
        <button>Hover</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button').parentElement);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => jest.advanceTimersByTime(150));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Helpful text');
  });

  it('hides tooltip on mouseLeave', () => {
    render(
      <Tooltip content="Helpful text" delay={0}>
        <button>Hover</button>
      </Tooltip>
    );

    const wrapper = screen.getByRole('button').parentElement;
    fireEvent.mouseEnter(wrapper);
    act(() => jest.advanceTimersByTime(50));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.mouseLeave(wrapper);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  // ─── Focus / blur ─────────────────────────────────────────────────────────
  it('shows tooltip on focus', () => {
    render(
      <Tooltip content="Focus tip" delay={0}>
        <button>Focus me</button>
      </Tooltip>
    );

    const wrapper = screen.getByRole('button').parentElement;
    fireEvent.focus(wrapper);
    act(() => jest.advanceTimersByTime(50));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('hides tooltip on blur', () => {
    render(
      <Tooltip content="Focus tip" delay={0}>
        <button>Focus me</button>
      </Tooltip>
    );

    const wrapper = screen.getByRole('button').parentElement;
    fireEvent.focus(wrapper);
    act(() => jest.advanceTimersByTime(50));
    fireEvent.blur(wrapper);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  // ─── Disabled ────────────────────────────────────────────────────────────
  it('does not show tooltip when disabled=true', () => {
    render(
      <Tooltip content="Should not appear" disabled delay={0}>
        <button>Btn</button>
      </Tooltip>
    );

    const wrapper = screen.getByRole('button').parentElement;
    fireEvent.mouseEnter(wrapper);
    act(() => jest.advanceTimersByTime(200));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  // ─── Placements ───────────────────────────────────────────────────────────
  ['top', 'bottom', 'left', 'right'].forEach((placement) => {
    it(`renders with placement="${placement}"`, () => {
      render(
        <Tooltip content="Tip" placement={placement} delay={0}>
          <button>Btn</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button').parentElement);
      act(() => jest.advanceTimersByTime(50));
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  // ─── Custom maxWidth ──────────────────────────────────────────────────────
  it('applies custom maxWidth to tooltip', () => {
    render(
      <Tooltip content="Tip" maxWidth={300} delay={0}>
        <button>Btn</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button').parentElement);
    act(() => jest.advanceTimersByTime(50));
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveStyle({ maxWidth: '300px' });
  });
});
