// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        color1: '#ffffff',
        color2: '#0066FF',
        color3: '#00D2FF',
        color4: '#e2e8f0',
        color5: '#0f172a',
      }
    },
  },
  plugins: [],
}