// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import vanillaExtract from '@antebudimir/eslint-plugin-vanilla-extract';
import eslintPluginPrettier from 'eslint-plugin-prettier';

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config({ ignores: ['dist'] }, {
  extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
  },
  plugins: {
    prettier: eslintPluginPrettier,
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-template': 'error',
    'eqeqeq': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
  },
}, {
  files: ['**/*.css.ts'],
  plugins: {
    'vanilla-extract': vanillaExtract,
  },
  rules: {
    'vanilla-extract/concentric-order': 'error',
    'vanilla-extract/no-empty-style-blocks': 'off',
    'vanilla-extract/no-trailing-zero': 'error',
    'vanilla-extract/no-zero-unit': 'off',
    'vanilla-extract/no-unknown-unit': 'error',
    'vanilla-extract/no-unitless-values': 'error',
  },
},
storybook.configs["flat/recommended"]);
