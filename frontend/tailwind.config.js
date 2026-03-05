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
        color1: '#f4f7f9', // Fundo principal super suave (confortável para os olhos)
        color2: '#0066FF', // Azul Primário
        color3: '#00D2FF', // Azul Secundário
        color4: '#e2e8f0', // Bordas e Neutros (slate-200)
        color5: '#0f172a', // Texto principal (slate-900)
      }
    },
  },
  plugins: [],
}