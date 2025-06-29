// tailwind.config.js
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          50: '#E1F0FF',
          100: '#B4D6FF',
          200: '#84BBFF',
          300: '#569EFF',
          400: '#3884FF',
          500: '#3E97FF',
          600: '#0095E8',
          700: '#0077C5',
          800: '#005AA3',
          900: '#003D82',
          DEFAULT: '#3E97FF',
        },
        // Secondary Colors
        secondary: {
          50: '#F3F6F9',
          100: '#E7E9EF',
          200: '#D0D4DE',
          300: '#B5BBC9',
          400: '#9399AC',
          500: '#7E8299',