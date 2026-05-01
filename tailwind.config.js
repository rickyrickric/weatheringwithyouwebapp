/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          lighter: 'rgba(255, 255, 255, 0.05)',
        },
        openweather: {
          primary: '#EB6E4B',      // Safety Orange - Primary accent
          secondary: '#AEECEF',    // Pale Cyan - Rain/Water indicators
          card: 'rgba(255, 255, 255, 0.9)',  // Off-White Glass - Card background
          text: '#48484A',         // Deep Charcoal - Primary text
          border: '#EDEDED',       // Soft Gray - Borders
          textLight: '#999999',    // Medium Gray - Secondary text
        },
      },
      backdropBlur: {
        xs: '2px',
        'sm': '4px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        '.glass-card': {
          '@apply bg-white/5 border border-white/10 backdrop-blur rounded-2xl': {},
        },
        '.glass-card-light': {
          '@apply bg-white/90 backdrop-blur-lg border border-white/30 rounded-2xl shadow-lg': {},
        },
        '.kpi-tile': {
          '@apply bg-white/95 rounded-xl p-4 border border-white/20 shadow-sm hover:shadow-md transition-shadow': {},
        },
      });
    },
  ],
}
