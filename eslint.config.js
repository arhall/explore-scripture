import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        fetch: 'readonly',
        URLSearchParams: 'readonly',
        performance: 'readonly',
        navigator: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        PerformanceObserver: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        CustomEvent: 'readonly',
        history: 'readonly',
        module: 'readonly',
        IntersectionObserver: 'readonly',
        AbortController: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    // Configuration for build scripts
    files: ['scripts/**/*.js', '.eleventy.js', 'jest.config.js', 'performance.config.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // Allow console in build scripts
    },
  },
  {
    // Configuration for ES modules like telemetry.js
    files: ['src/assets/telemetry.js'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 2022,
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        performance: 'readonly',
        navigator: 'readonly',
      },
    },
  },
  {
    // Ignore patterns
    ignores: [
      '_site/**',
      'node_modules/**',
      'test-env/**',
      'debug-env/**',
      'tmp/**',
      'build-logs/**',
      'src/assets/debug-dashboard.js', // Contains TypeScript syntax
    ],
  },
];
