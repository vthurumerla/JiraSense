module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: ['eslint:recommended', 'plugin:react-hooks/recommended'],
  ignorePatterns: ['dist'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  }
};
