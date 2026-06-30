import type { Config } from 'prettier';

const config: Config = {
  semi: true,
  tabWidth: 2,
  printWidth: 130,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  plugins: ['prettier-plugin-tailwindcss'],
};

export default config;
