module.exports = {
  collectCoverageFrom: [
    '<rootDir>/packages/*/src/**/*.{js,jsx,ts,tsx}',
    '!<rootDir>/*.{spec,test}.{js,jsx,ts,tsx}',
    '!<rootDir>/*.json',
    '!<rootDir>/node_modules/**',
    '!<rootDir>/packages/playground/**',
    '!<rootDir>/samples/**'
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'cobertura'],
  globals: {
    npm_package_version: '0.0.0-0.jest'
  },
  moduleDirectories: ['node_modules', 'packages'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        ancestorSeparator: ' › ',
        classNameTemplate: '{filepath}',
        includeConsoleOutput: true,
        outputDirectory: 'coverage',
        suiteName: 'BotFramework-WebChat',
        titleTemplate: ({ classname, filename, title }) =>
          [filename, classname, title]
            .map(value => (value || '').trim())
            .filter(value => value)
            .join(' › ')
      }
    ]
  ],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup/preSetupTestFramework.js'],
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/setup/',
    '<rootDir>/packages/directlinespeech/__tests__/utilities/',
    '<rootDir>/packages/playground/',
    '<rootDir>/samples/'
  ],
  transform: {
    '\\.[jt]sx?$': './babel-jest-config.js'
  }
};
