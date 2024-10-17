module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Add this to scan your components for Tailwind CSS
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('tailwindcss-animate')],
}
