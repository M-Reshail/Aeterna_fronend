// Jest setup file — runs after the test framework is initialized
import '@testing-library/jest-dom';

// Silence known prop-types and recharts warnings in tests
const originalError = console.error.bind(console);
beforeAll(() => {
  console.error = (...args) => {
    const msg = args[0];
    if (
      typeof msg === 'string' &&
      (msg.includes('Warning: An update to') ||
        msg.includes('ReactDOM.render') ||
        msg.includes('recharts') ||
        msg.includes('ResizeObserver'))
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock window.matchMedia (used by some Tailwind / responsive components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver (used by Recharts)
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock URL.createObjectURL (used by CSV export)
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock socket.io-client globally
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    connected: false,
    connect: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    auth: {},
  })),
}));
