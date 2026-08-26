/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101A2E",
        slate: {
          850: "#172033",
        },
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          400: "#5B6EF5",
          500: "#3B4DE0",
          600: "#2E3BC4",
          700: "#232E99",
        },
        amber: {
          400: "#F2A93B",
          500: "#E2921F",
        },
      },
      fontFamily: {
        display: ["Georgia", "'Times New Roman'", "serif"],
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
