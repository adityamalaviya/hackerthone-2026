/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        civic: {
          50: '#fbfbfa',
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
          resolved: '#16a34a',
          closed: '#52525b',
        }
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
      }
    },
  },
  plugins: [],
}
