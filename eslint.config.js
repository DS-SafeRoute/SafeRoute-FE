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
import importPlugin from 'eslint-plugin-import';

export default tseslint.config({ ignores: ['dist', 'storybook-static/**'] }, {
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
    import: importPlugin,
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

    'react/react-in-jsx-scope': 'off', // React 17+에서는 React import 필요 없음
    '@typescript-eslint/no-confusing-void-expression': 'off', // void 표현 규칙 무시
    '@typescript-eslint/strict-boolean-expressions': 'off', // 엄격한 boolean 표현 사용 X
    '@typescript-eslint/explicit-function-return-type': 'off', // 함수 반환 타입 명시 필요 없음
    '@typescript-eslint/naming-convention': 'off', // 명명 규칙 강제하지 않음
    '@typescript-eslint/no-floating-promises': 'off', // 처리되지 않은 Promises 경고 무시
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ], // 사용되지 않는 변수 경고 (_prefix 무시)

    // import 순서 규칙
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
          'type',
          'object',
        ],
        pathGroups: [
          // react를 external 최상단에
          { pattern: 'react', group: 'external', position: 'before' },

          // path alias를 internal로 분류
          { pattern: '@pages/**', group: 'internal', position: 'before' },
          { pattern: '@routes/**', group: 'internal', position: 'before' },
          { pattern: '@store/**', group: 'internal', position: 'before' },

          { pattern: '@apis/**', group: 'internal', position: 'before' },
          { pattern: '@assets/**', group: 'internal', position: 'before' },
          {
            pattern: '@components/**',
            group: 'internal',
            position: 'before',
          },
          { pattern: '@constants/**', group: 'internal', position: 'before' },
          { pattern: '@hooks/**', group: 'internal', position: 'before' },
          { pattern: '@styles/**', group: 'internal', position: 'before' },
          // @types는 npm @types 스코프와 충돌 → @shared/types/ 사용
          { pattern: '@utils/**', group: 'internal', position: 'before' },
          { pattern: '@shared/**', group: 'internal', position: 'before' },
        ],
        pathGroupsExcludedImportTypes: ['react'],

        // 그룹 사이 빈줄
        'newlines-between': 'always',

        // 그룹 내 알파벳 정렬
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
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
