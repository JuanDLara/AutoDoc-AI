/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'xxs': '0.65rem',
      },
      spacing: {
        '98': '26rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
