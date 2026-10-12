import css from '@eslint/css';

export default [
  {
    files: ['**/*.css'],
    language: 'css/css',
    plugins: { css },
    rules: {
      ...css.configs.recommended.rules,
      'css/no-important': 'off',
      'css/no-invalid-properties': ['error', { allowUnknownVariables: true }],
      'css/use-baseline': 'off',
    },
  },
];
