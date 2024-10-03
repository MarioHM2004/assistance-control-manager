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
          primary: "#8B4513",   // Keep the brown-red color for buttons and action elements
          secondary: "#7A7A7A", // Darken the gray for better contrast
          accent: "#3C3C3C",    // Darker accent color for borders and shadows
          neutral: "#CD853F",   // Adjust the brick-red to be more orange for warmth
          "base-100": "#FDFDFD", // Make the background closer to pure white for cleanliness
          info: "#5A9BD4",      // Slightly lighten the blue for info elements
          success: "#3CB371",   // Brighten the green for success notifications
          warning: "#FFA07A",   // A softer orange for warnings
          error: "#DC143C",     // A brighter red for errors
        },
      },
    ],
  },
};
