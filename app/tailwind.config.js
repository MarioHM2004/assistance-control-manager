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
          primary: '#7A3E2B',      // Marrón oscuro del logo
          secondary: '#C26134',    // Anaranjado oscuro
          accent: '#F0A25C',       // Anaranjado claro
          neutral: '#EAEAEA',      // Gris claro
          'base-100': '#F5F5F5',   // Fondo claro
          info: '#89CFF0',         // Azul claro
          warning: '#F4A261',      // Amarillo suave
          error: '#E76F51',        // Rojo claro
          success: '#2A9D8F',      // Verde oscuro
        },
      },
    ],
  },
};
