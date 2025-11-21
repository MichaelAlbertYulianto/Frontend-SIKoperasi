/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#E6F0FF', 
          800: '#1D4ED8', 
        },
        info: { 
          100: '#CCFBF1', 
          800: '#0F766E', 
        },
        brand: {
             500: '#03C9D7',
        },
        success: { 
             100: '#D1FAE5',
             800: '#065F46',
        },
        warning: {
             100: '#FFFBEB',
             800: '#92400E',
        },
        error: {
             100: '#FEE2E2',
             800: '#991B1B',
        },
        // ... (Warna lain yang Anda gunakan)
      },
    },
  },
  plugins: [],
}