const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.{js,jsx}'],
  transform: { '^.+\\.(js|jsx)$': 'babel-jest' },
  moduleNameMapper: {
    '^@components(.*)$': '<rootDir>/src/components$1',
    '^@pages(.*)$': '<rootDir>/src/pages$1',
    '^@hooks(.*)$': '<rootDir>/src/hooks$1',
    '^@services(.*)$': '<rootDir>/src/services$1',
    '^@contexts(.*)$': '<rootDir>/src/contexts$1',
    '^@utils(.*)$': '<rootDir>/src/utils$1',
    '^@tests(.*)$': '<rootDir>/src/tests$1',
    '\\.(css|scss)$': 'identity-obj-proxy',
    '\\.(jpg|png|svg)$': '<rootDir>/src/tests/__mocks__/fileMock.js'
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleFileExtensions: ['js', 'jsx', 'json'],
  collectCoverageFrom: [
    // Utilities & contexts — fully tested
    'src/utils/**/*.{js,jsx}',
    'src/contexts/**/*.{js,jsx}',
    // Common UI components — fully tested
    'src/components/auth/**/*.{js,jsx}',
    'src/components/common/**/*.{js,jsx}',
    // Services with dedicated test files
    'src/services/alertsService.js',
    'src/services/authService.js',
    // Pages with dedicated test files
    'src/pages/Login.jsx',
    'src/pages/NotFound.jsx',
    'src/pages/Settings.jsx',
    'src/pages/AlertHistory.jsx',
    // Exclusions
    '!src/**/__mocks__/**',
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 65,
      lines: 70,
    },
  },
};
module.exports = config;
