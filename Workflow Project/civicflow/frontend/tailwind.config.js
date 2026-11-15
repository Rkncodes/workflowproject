/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a192f',
          800: '#112240',
          700: '#1e3a5f',
          600: '#233554',
          500: '#334e68',
        },
        gov: {
          blue: '#1b365d',
          gold: '#c5a059',
          lightBlue: '#e2e8f0',
          accent: '#0d9488',
        }
      }
    },
  },
  plugins: [],
}

