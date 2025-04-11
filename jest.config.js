export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest'],
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  collectCoverage: true,
  collectCoverageFrom: [
    'client/**/*.{js,jsx,ts,tsx}',
    '!client/**/*.d.ts',
    '!client/**/*.stories.{js,jsx,ts,tsx}',
    '!client/**/_*.{js,jsx,ts,tsx}',
    '!client/**/*.test.{js,jsx,ts,tsx}',
  ],
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: './coverage',
  transformIgnorePatterns: [
    '/node_modules/(?!(jest-)?@?react|@?react-dom|@?react-router|@?react-router-dom|@?@testing-library|@?@emotion|@?@babel|@?@mui)',
  ],
}; 