const path = require('path');

const rootDir = __dirname;
const setupFilesAfterEnv = [path.join(rootDir, 'tests/setup.js')];

module.exports = {
  rootDir,
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
  testTimeout: 30000, // 30 seconds
  forceExit: true, // Force Jest to exit
  detectOpenHandles: true, // Help debug async issues
  testSequencer: '<rootDir>/tests/utils/performance-test-sequencer.js',
  projects: [
    {
      displayName: 'default',
      rootDir,
      testEnvironment: 'jsdom',
      setupFilesAfterEnv,
      testMatch: [
        '<rootDir>/tests/data.test.js',
        '<rootDir>/tests/filters.test.js',
        '<rootDir>/tests/characters.test.js',
        '<rootDir>/tests/build.test.js',
        '<rootDir>/tests/pwa-update.test.js',
      ],
    },
    {
      displayName: 'performance',
      rootDir,
      testEnvironment: 'node',
      setupFilesAfterEnv,
      maxWorkers: 1,
      testMatch: [
        '<rootDir>/tests/performance.test.js',
        '<rootDir>/tests/lighthouse.test.js',
        '<rootDir>/tests/benchmark.test.js',
        '<rootDir>/tests/performance-summary.test.js',
      ],
    },
  ],
};
