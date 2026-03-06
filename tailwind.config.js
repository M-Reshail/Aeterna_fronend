/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium OLED Black palette
        black: {
          oled: '#000000',      // Pure OLED black
          deep: '#0A0A0A',      // Off-black for secondary containers
          card: '#1A1A1A',      // Border and container backgrounds
          hover: '#2C2C2C',     // Hover states
        },
        white: {
          primary: '#FFFFFF',   // Pure white for headings
          secondary: '#E5E7EB', // Soft white for secondary text
          muted: '#CBD5E1',     // Light cool gray for muted text
        },
        // Emerald accents (kept for accent use)
        emerald: {
          400: '#10b981',
          500: '#059669',
          600: '#047857',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'sans-serif'],
      },
      letterSpacing: {
        tight: '-0.05em',
      },
      borderRadius: {
        glass: '16px',
      },
      boxShadow: {
        glow: '0 0 20px rgba(255, 255, 255, 0.2)',
        'glow-sm': '0 0 10px rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        glass: '10px',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
