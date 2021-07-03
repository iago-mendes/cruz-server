module.exports = {
  bail: true,
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**'],
  coverageDirectory: 'tests/coverage',
  coverageProvider: 'v8',
	preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.ts?(x)'
  ],
};
