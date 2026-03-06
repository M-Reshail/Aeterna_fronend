import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input, Textarea, Select, Checkbox } from '@components/common/FormInput';

describe('Input (FormInput)', () => {
  it('renders without label by default', () => {
    render(<Input value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders label text when provided', () => {
    render(<Input label="Email address" value="" onChange={() => {}} />);
    expect(screen.getByText(/email address/i)).toBeInTheDocument();
  });

  it('renders required asterisk when required=true', () => {
    render(<Input label="Email" required value="" onChange={() => {}} />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders error message when error prop is provided', () => {
    render(<Input label="Email" error="Invalid email" value="" onChange={() => {}} />);
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });

  it('does not render error container when no error', () => {
    render(<Input label="Email" value="" onChange={() => {}} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('calls onChange when user types', () => {
    const handleChange = jest.fn();
    render(<Input value="" onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('calls onBlur when field loses focus', () => {
    const handleBlur = jest.fn();
    render(<Input value="" onChange={() => {}} onBlur={handleBlur} />);
    fireEvent.blur(screen.getByRole('textbox'));
    expect(handleBlur).toHaveBeenCalled();
  });

  it('is disabled when disabled=true', () => {
    render(<Input value="" onChange={() => {}} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders as password input when type="password"', () => {
    render(<Input type="password" value="" onChange={() => {}} />);
    const input = document.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });

  it('renders placeholder text', () => {
    render(<Input placeholder="Enter email" value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
  });
});

// ─── Textarea ─────────────────────────────────────────────────────────────────
describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Textarea label="Message" value="" onChange={() => {}} />);
    expect(screen.getByText('Message')).toBeInTheDocument();
  });

  it('renders required asterisk when required=true', () => {
    render(<Textarea label="Message" required value="" onChange={() => {}} />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders error message when error prop provided', () => {
    render(<Textarea label="Msg" error="Too short" value="" onChange={() => {}} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Too short');
  });

  it('does not render error when no error', () => {
    render(<Textarea value="" onChange={() => {}} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const handleChange = jest.fn();
    render(<Textarea value="" onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('is disabled when disabled=true', () => {
    render(<Textarea value="" onChange={() => {}} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});

// ─── Select ───────────────────────────────────────────────────────────────────
describe('Select', () => {
  const options = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
  ];

  it('renders a select element', () => {
    render(<Select options={options} value="" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Select label="Choose" options={options} value="" onChange={() => {}} />);
    expect(screen.getByText('Choose')).toBeInTheDocument();
  });

  it('renders all options plus default empty option', () => {
    render(<Select options={options} value="" onChange={() => {}} />);
    expect(screen.getByRole('option', { name: /Select\.\.\./i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option A' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option B' })).toBeInTheDocument();
  });

  it('renders error message when error prop provided', () => {
    render(<Select options={options} error="Required" value="" onChange={() => {}} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('calls onChange when selection changes', () => {
    const handleChange = jest.fn();
    render(<Select options={options} value="" onChange={handleChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'a' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('is disabled when disabled=true', () => {
    render(<Select options={options} value="" onChange={() => {}} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});

// ─── Checkbox ─────────────────────────────────────────────────────────────────
describe('Checkbox', () => {
  it('renders a checkbox input', () => {
    render(<Checkbox checked={false} onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Checkbox label="Accept terms" checked={false} onChange={() => {}} />);
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('is checked when checked=true', () => {
    render(<Checkbox checked onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('is unchecked when checked=false', () => {
    render(<Checkbox checked={false} onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('calls onChange when toggled', () => {
    const handleChange = jest.fn();
    render(<Checkbox checked={false} onChange={handleChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalled();
  });

  it('is disabled when disabled=true', () => {
    render(<Checkbox checked={false} onChange={() => {}} disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});
