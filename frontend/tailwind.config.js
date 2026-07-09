/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#003366',
        'primary-light': '#0055A5',
        'primary-dark': '#002244',
        secondary: '#4A7C59',
        'secondary-light': '#5E9D6E',
        'secondary-dark': '#3A6347',
        accent: '#F5A623',
        'accent-light': '#FFB940',
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
