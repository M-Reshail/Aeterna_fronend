/**
 * Unit tests for src/components/common/UI.jsx
 * Covers: Card, Badge, Alert, Spinner, Modal
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card, Badge, Alert, Spinner, Modal } from '@components/common/UI';

// ─── Card ─────────────────────────────────────────────────────────────────────
describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies extra className', () => {
    const { container } = render(<Card className="extra-class">content</Card>);
    expect(container.firstChild).toHaveClass('extra-class');
  });

  it('fires onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Card onClick={handleClick}>Click me</Card>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies elevated shadow for variant="elevated"', () => {
    const { container } = render(<Card variant="elevated">Elevated</Card>);
    expect(container.firstChild).toHaveClass('shadow-lg');
  });

  it('applies cursor-pointer when hoverable', () => {
    const { container } = render(<Card hoverable>Hoverable</Card>);
    expect(container.firstChild).toHaveClass('cursor-pointer');
  });
});

// ─── Badge ────────────────────────────────────────────────────────────────────
describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  const variants = ['primary', 'success', 'info', 'danger', 'warning', 'emerald'];
  variants.forEach((variant) => {
    it(`renders with variant="${variant}"`, () => {
      render(<Badge variant={variant}>{variant}</Badge>);
      expect(screen.getByText(variant)).toBeInTheDocument();
    });
  });

  const sizes = ['sm', 'md', 'lg'];
  sizes.forEach((size) => {
    it(`renders with size="${size}"`, () => {
      render(<Badge size={size}>badge</Badge>);
      expect(screen.getByText('badge')).toBeInTheDocument();
    });
  });

  it('applies extra className', () => {
    render(<Badge className="custom-cls">B</Badge>);
    expect(screen.getByText('B')).toHaveClass('custom-cls');
  });
});

// ─── Alert ───────────────────────────────────────────────────────────────────
describe('Alert', () => {
  it('renders children', () => {
    render(<Alert>Alert message</Alert>);
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Alert title="Warning!">Detail</Alert>);
    expect(screen.getByText('Warning!')).toBeInTheDocument();
  });

  const types = ['info', 'success', 'warning', 'danger'];
  types.forEach((type) => {
    it(`renders type="${type}" without crashing`, () => {
      render(<Alert type={type}>Message</Alert>);
      expect(screen.getByText('Message')).toBeInTheDocument();
    });
  });

  it('renders a close button when onClose is provided', () => {
    const handleClose = jest.fn();
    render(<Alert onClose={handleClose}>Close me</Alert>);
    const closeBtn = screen.getByRole('button');
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not render a close button when onClose is not provided', () => {
    render(<Alert>No close</Alert>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

// ─── Spinner ─────────────────────────────────────────────────────────────────
describe('Spinner', () => {
  it('renders an SVG element', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with size="sm"', () => {
    const { container } = render(<Spinner size="sm" />);
    expect(container.querySelector('svg')).toHaveClass('h-4', 'w-4');
  });

  it('renders with size="lg"', () => {
    const { container } = render(<Spinner size="lg" />);
    expect(container.querySelector('svg')).toHaveClass('h-12', 'w-12');
  });

  it('applies extra className', () => {
    const { container } = render(<Spinner className="my-spinner" />);
    expect(container.querySelector('svg')).toHaveClass('my-spinner');
  });
});

// ─── Modal ───────────────────────────────────────────────────────────────────
describe('Modal', () => {
  it('renders nothing when isOpen=false', () => {
    render(<Modal isOpen={false}>Content</Modal>);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders children when isOpen=true', () => {
    render(<Modal isOpen>Modal body</Modal>);
    expect(screen.getByText('Modal body')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Modal isOpen title="My Modal">Body</Modal>);
    expect(screen.getByText('My Modal')).toBeInTheDocument();
  });

  it('renders close button by default', () => {
    const handleClose = jest.fn();
    render(<Modal isOpen onClose={handleClose}>Body</Modal>);
    const closeBtn = screen.getByRole('button');
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not render close button when closeButton=false', () => {
    render(<Modal isOpen closeButton={false}>Body</Modal>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  const sizes = ['sm', 'md', 'lg', 'xl', '2xl'];
  sizes.forEach((size) => {
    it(`renders with size="${size}" without crashing`, () => {
      render(<Modal isOpen size={size}>Body</Modal>);
      expect(screen.getByText('Body')).toBeInTheDocument();
    });
  });
});
