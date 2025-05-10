/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f6ff',
          100: '#e0ecff',
          200: '#c0d9ff',
          300: '#92baff',
          400: '#5b91ff',
          500: '#3b6bfa',
          600: '#2447f1',
          700: '#1d39de',
          800: '#1e30b4',
          900: '#1d2e8f',
          950: '#141b51',
        },
        secondary: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5dae3',
          300: '#b2bbcb',
          400: '#8996af',
          500: '#6a7994',
          600: '#53617a',
          700: '#444f63',
          800: '#3a4252',
          900: '#343947',
          950: '#20232b',
        },
        accent: {
          50: '#fff4ed',
          100: '#ffe6d5',
          200: '#fec9aa',
          300: '#fda675',
          400: '#fc7c3c',
          500: '#fa5e17',
          600: '#ea470a',
          700: '#c2360a',
          800: '#9a2c0f',
          900: '#7d270f',
          950: '#431006',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};