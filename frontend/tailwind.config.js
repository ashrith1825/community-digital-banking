/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Premium Fintech Palette
        primary: {
          50:  '#f5faff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
        },
        accent: {
          100: '#f0fdf4',
          200: '#bbf7d0',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        danger: {
          100: '#fef2f2',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        gold: {
          100: '#fefce8',
          400: '#facc15',
          500: '#eab308',
        },
        dark: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(16,30,54,0.08)',
        'focus': '0 0 0 3px rgba(14,165,233,0.25)',
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
      transitionProperty: {
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
};
