// @ts-check
const angular = require('@angular-eslint/eslint-plugin');
const angularTemplate = require('@angular-eslint/eslint-plugin-template');
const angularTemplateParser = require('@angular-eslint/template-parser');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const importX = require('eslint-plugin-import-x');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.app.json',
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: ['**/*.spec.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.spec.json',
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
    },
  },
  {
    files: ['**/*.ts'],
    plugins: {
      '@angular': angular,
    },
    rules: {
      '@angular/component-class-suffix': ['error', { suffixes: ['Component', 'Dialog'] }],
      '@angular/component-selector': ['error', { type: 'element', style: 'kebab-case' }],
      '@angular/directive-class-suffix': 'error',
      '@angular/directive-selector': ['error', { type: 'attribute', style: 'camelCase' }],
      '@angular/no-input-prefix': 'warn',
      '@angular/no-input-rename': 'warn',
      '@angular/no-inputs-metadata-property': 'warn',
      '@angular/no-output-native': 'warn',
      '@angular/no-output-on-prefix': 'warn',
      '@angular/no-output-rename': 'warn',
      '@angular/no-outputs-metadata-property': 'warn',
      '@angular/no-pipe-impure': 'warn',
      '@angular/prefer-standalone': 'error',
      '@angular/use-lifecycle-interface': 'error',
      '@angular/use-pipe-transform-interface': 'error',
      '@angular/prefer-on-push-component-change-detection': 'warn',
      '@angular/no-empty-lifecycle-method': 'warn',
      '@angular/use-component-view-encapsulation': 'warn',
      '@angular/use-injectable-provided-in': 'error',
      '@angular/prefer-inject': 'warn',
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular/template': angularTemplate,
    },
    rules: {
      '@angular/template/banana-in-box': 'error',
      '@angular/template/no-any': 'error',
      '@angular/template/no-autofocus': 'warn',
      '@angular/template/no-call-expression': 'error',
      '@angular/template/no-distracting-elements': 'warn',
      '@angular/template/no-positive-tabindex': 'warn',
      '@angular/template/valid-aria': 'error',
      '@angular/template/alt-text': 'error',
      '@angular/template/button-has-type': 'error',
      '@angular/template/click-events-have-key-events': 'warn',
      '@angular/template/prefer-control-flow': 'warn',
    },
  },
  {
    files: ['**/*.ts'],
    plugins: {
      'import-x': importX,
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.app.json',
        },
      },
      'import-x/internal-regex': '^src/',
    },
    rules: {
      'import-x/no-duplicates': 'error',
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
            'unknown',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  {
    ignores: ['**/dist/**', '**/*.d.ts', 'eslint.config.js'],
  },
];
