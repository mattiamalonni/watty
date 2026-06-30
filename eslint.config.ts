import prettierConfig from 'eslint-config-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  // Ignore build output and deps
  { ignores: ['out/**', 'dist/**', 'node_modules/**'] },

  // TypeScript strict rules — all source files
  {
    files: ['**/*.{ts,tsx}'],
    extends: tseslint.configs.strict,
  },

  // Main + Preload: Node.js globals
  {
    files: ['src/main/**/*.ts', 'src/preload/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },

  // Renderer: browser globals + React rules
  {
    files: ['src/renderer/**/*.{ts,tsx}'],
    extends: [
      reactPlugin.configs.flat.recommended,
      reactPlugin.configs.flat['jsx-runtime'],
      reactHooksPlugin.configs.flat.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'react/prop-types': 'off', // TypeScript handles prop types
    },
  },

  // Prettier: disable conflicting style rules — must be last
  prettierConfig,
);
