import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F17',
        surface: '#151C2C',
        surfaceHover: '#1E293B',
        border: '#2A364F',
        primary: {
          50: '#EEF2FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
        accent: '#10B981',
      },
    },
  },
  plugins: [],
};
export default config;
