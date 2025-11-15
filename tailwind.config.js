/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Northeastern Primary Colors
        'northeastern-red': '#d41b2c',
        'northeastern-red-dark': '#a31621',
        'northeastern-red-light': '#e63946',
        
        // Northeastern Secondary Colors
        'northeastern-black': '#000000',
        'northeastern-gray': {
          50: '#f9fafb',
          100: '#f4f4f4',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        'sans': ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
        'display': ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'neu': '0 8px 32px 0 rgba(212, 27, 44, 0.15)',
        'neu-hover': '0 12px 48px 0 rgba(212, 27, 44, 0.25)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
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
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}