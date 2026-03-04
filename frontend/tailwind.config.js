// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        color1: '#f8fafc', 
        color2: '#0066FF', 
        color3: '#00D2FF', 
        color4: '#cbd5e1', 
        color5: '#0f172a', 
      }
    },
  },
  plugins: [],
}