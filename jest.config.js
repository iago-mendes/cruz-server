module.exports = {
  bail: true,
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**'],
  coverageDirectory: 'tests/coverage',
  coverageProvider: 'v8',
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.ts?(x)'
  ],
};
