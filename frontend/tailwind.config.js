/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf4ff',
          100: '#fae8ff',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
        },
        gray: {
          950: '#030712',
        },
        purple: {
          950: '#1a0533',
        },
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px 2px rgba(168,85,247,0.3)' },
          '50%':       { boxShadow: '0 0 40px 8px rgba(236,72,153,0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'scroll-x': {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        shimmer:     'shimmer 3s linear infinite',
        'pulse-glow':'pulse-glow 2.5s ease-in-out infinite',
        float:       'float 3s ease-in-out infinite',
        'scroll-x':  'scroll-x 45s linear infinite',
      },
    },
  },
  plugins: [],
};

