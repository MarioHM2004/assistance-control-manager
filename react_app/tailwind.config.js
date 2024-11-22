/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      'winter',
      'synthwave',
      'lofi',
      {
        diselStudio: {
          primary: '#7A3E2B',
          secondary: '#C26134',
          accent: '#F0A25C',
          neutral: '#EAEAEA',
          'base-100': '#F5F5F5',
          info: '#89CFF0',
          warning: '#F4A261',
          error: '#E76F51',
          success: '#2A9D8F',
        },
      },
    ],
  },
};
