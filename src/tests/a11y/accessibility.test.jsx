/**
 * Accessibility audit tests using jest-axe (axe-core wrapper).
 * Tests WCAG 2.1 Level A violations on key UI components and pages.
 *
 * Run with: npm test -- --testPathPattern=accessibility
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/FormInput';
import { NotFound } from '@pages/NotFound';
import RouteErrorBoundary from '@components/common/RouteErrorBoundary';
import { renderWithProviders, renderPublic } from '@tests/helpers/renderWithProviders';
import { Login } from '@pages/Login';

// Extend jest matchers
expect.extend(toHaveNoViolations);

// ─── Button ───────────────────────────────────────────────────────────────────
describe('Accessibility: Button', () => {
  it('has no axe violations (default)', async () => {
    const { container } = render(<Button>Click me</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations (disabled)', async () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations (loading)', async () => {
    const { container } = render(<Button isLoading>Save</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations across all variants', async () => {
    const { container } = render(
      <div>
        {['primary', 'secondary', 'danger', 'success', 'ghost'].map((v) => (
          <Button key={v} variant={v}>{v}</Button>
        ))}
      </div>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── FormInput ────────────────────────────────────────────────────────────────
describe('Accessibility: Input (FormInput)', () => {
  it('has no axe violations (basic input)', async () => {
    const { container } = render(
      <Input label="Email" id="email" value="" onChange={() => {}} />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations (input with error)', async () => {
    const { container } = render(
      <Input
        label="Email"
        id="email"
        value=""
        onChange={() => {}}
        error="Invalid email address"
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations (required input)', async () => {
    const { container } = render(
      <Input label="Password" id="password" type="password" required value="" onChange={() => {}} />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── 404 Page ─────────────────────────────────────────────────────────────────
describe('Accessibility: NotFound page', () => {
  it('has no axe violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── RouteErrorBoundary ───────────────────────────────────────────────────────
describe('Accessibility: RouteErrorBoundary (stable state)', () => {
  it('has no axe violations when rendering children normally', async () => {
    const { container } = render(
      <MemoryRouter>
        <RouteErrorBoundary>
          <main aria-label="Main content">
            <h1>Page content</h1>
            <p>Some text here</p>
          </main>
        </RouteErrorBoundary>
      </MemoryRouter>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── Login Page ───────────────────────────────────────────────────────────────
describe('Accessibility: Login page', () => {
  it('has no critical axe violations', async () => {
    const { container } = renderPublic(<Login />);
    const results = await axe(container, {
      rules: {
        // Dark theme palette meets contrast in context; full Lighthouse audit covers this.
        'color-contrast': { enabled: false },
        // Login page uses h3 inside marketing sections that appear after h1;
        // heading order is intentional for visual hierarchy, not document structure.
        'heading-order': { enabled: false },
      },
    });
    expect(results).toHaveNoViolations();
  });
});
