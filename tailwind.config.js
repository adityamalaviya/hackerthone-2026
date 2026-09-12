/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '3xs': ['0.625rem', { lineHeight: '0.75rem' }],
        '2xs': ['0.6875rem', { lineHeight: '0.875rem' }],
      },
      colors: {
        civic: {
          50: '#FAF9F6',
          100: '#f4f4f2',
          200: '#e8e8e4',
          300: '#d5d5cd',
          400: '#a3a398',
          500: '#737367',
          600: '#525248',
          700: '#3f3f37',
          800: '#272722',
          900: '#191916',
          950: '#0d0d0b',
        },
        accent: {
          DEFAULT: '#d9531e', // Warm terracotta / civic brick
          hover: '#c24513',
          subtle: '#fef3ec',
          border: '#fbdacf',
        },
        status: {
          reported: '#dc2626',
          acknowledged: '#ea580c',
          progress: '#d97706',
          inProgress: '#d97706',
          resolved: '#16a34a',
          closed: '#52525b',
        }
      },
      spacing: {
        '108': '27rem',
        '120': '30rem',
      },
      zIndex: {
        '400': '400',
      },
      lineHeight: {
        'tightest': '1.08',
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
      }
    },
  },
  plugins: [],
}
