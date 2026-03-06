import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@components/common/Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('renders as type="button" by default', () => {
    render(<Button>Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('renders as type="submit" when specified', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled and shows loading spinner when isLoading is true', () => {
    render(<Button isLoading>Save</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('does not fire onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  describe('variants', () => {
    const variants = ['primary', 'secondary', 'danger', 'success', 'ghost'];
    variants.forEach((variant) => {
      it(`renders without crashing with variant="${variant}"`, () => {
        render(<Button variant={variant}>Btn</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });
  });

  describe('sizes', () => {
    const sizes = ['sm', 'md', 'lg'];
    sizes.forEach((size) => {
      it(`renders without crashing with size="${size}"`, () => {
        render(<Button size={size}>Btn</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });
  });

  it('applies extra className', () => {
    render(<Button className="extra-class">Btn</Button>);
    expect(screen.getByRole('button')).toHaveClass('extra-class');
  });
});
