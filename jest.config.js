module.exports = {
  collectCoverageFrom: ['<rootDir>/packages/*/src/**/*.{js,jsx,ts,tsx}'],
  coverageReporters: ['json', 'lcov', 'text-summary', 'clover', 'cobertura'],
  // We only have 4 instances of Chromium running simultaneously.
  maxWorkers: 4,
  projects: ['<rootDir>/__tests__/html2.setup/jest.config.js', '<rootDir>/__tests__/unit.setup/jest.config.js'],
  reporters: ['default', ['github-actions', { silent: false }]]
};
