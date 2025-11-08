/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'northeastern-red': '#d41b2c',
        'northeastern-gray': '#f4f4f4',
      },
    },
  },
  plugins: [],
}