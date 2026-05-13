/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg3: {
          gold: '#c8a84e',
          'gold-light': '#e4cc7a',
          'gold-dark': '#9a7a2e',
          crimson: '#8b1a1a',
          'crimson-light': '#b22222',
          parchment: '#f5e6c8',
          'parchment-dark': '#e8d5a8',
          dark: '#1a1a2e',
          'dark-mid': '#16213e',
          'dark-light': '#0f3460',
          ink: '#2c2c3a',
        },
        rarity: {
          common: '#9ca3af',
          uncommon: '#22c55e',
          rare: '#3b82f6',
          veryrare: '#a855f7',
          legendary: '#f59e0b',
          story: '#ec4899',
        }
      },
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      }
    },
  },
  plugins: [],
}
