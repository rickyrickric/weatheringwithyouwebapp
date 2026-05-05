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
          primary: '#D4622A',      // Desaturated Orange - Primary accent (QA fix)
          secondary: '#64748B',    // Slate 500 - Neutral for secondary metrics
          card: 'rgba(255, 255, 255, 0.05)',  // Very dark glass - Card background
          text: '#9CA3AF',         // Gray 400 - Primary text
          border: '#334155',       // Slate 700 - Borders
          textLight: '#6B7280',    // Gray 500 - Secondary text
          bg: '#121826',           // Flat dark slate background (QA fix)
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
        '.condition-tile': {
          '@apply rounded-2xl border backdrop-blur transition-shadow duration-300': {
            'background': 'rgba(10, 15, 30, 0.75)',
            'border-color': 'rgba(255, 255, 255, 0.12)',
            '&:hover': { 'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.4)' },
          },
        },
        '.chart-card': {
          '@apply w-full rounded-2xl border backdrop-blur p-4': {
            'background': 'rgba(8, 14, 35, 0.88)',
            'border-color': 'rgba(255, 255, 255, 0.1)',
          },
        },
      });
    },
  ],
}
