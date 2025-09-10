module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/_data/**/*.js',
    'scripts/**/*.js',
    '!src/_data/charactersByBook/**',
    '!node_modules/**',
    '!coverage/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000, // 30 seconds
  forceExit: true, // Force Jest to exit
  detectOpenHandles: true, // Help debug async issues
  projects: [
    {
      displayName: 'default',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/tests/data.test.js',
        '<rootDir>/tests/filters.test.js',
        '<rootDir>/tests/characters.test.js',
        '<rootDir>/tests/build.test.js',
      ],
    },
    {
      displayName: 'performance',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/tests/performance.test.js',
        '<rootDir>/tests/lighthouse.test.js',
        '<rootDir>/tests/benchmark.test.js',
      ],
    },
  ],
};
