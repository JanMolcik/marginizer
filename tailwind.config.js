/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        margin: {
          low: '#ef4444',
          medium: '#f59e0b',
          good: '#10b981',
        },
      },
    },
  },
  plugins: [],
}
