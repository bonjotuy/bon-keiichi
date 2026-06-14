/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#fdf8f0',
          100: '#faefd9',
          200: '#f5ddb3',
          300: '#eec47f',
          400: '#e6a84a',
          500: '#df8f27',
          600: '#c6741d',
          700: '#a45819',
          800: '#84451b',
          900: '#6c3918',
        }
      }
    },
  },
  plugins: [],
}
