/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f5f6fb",
          100: "#e9eaf6",
          400: "#8385ab",
          500: "#5d5f87",
          600: "#454770",
          700: "#33345a",
          800: "#23243f",
          900: "#161729",
        },
        iris: {
          50: "#f2f1fe",
          100: "#e4e1fd",
          400: "#8b7cf6",
          500: "#6d4de8",
          600: "#5532d6",
          700: "#4424b0",
        },
        aqua: {
          50: "#eafbf8",
          100: "#cdf5ee",
          400: "#3cc8b4",
          500: "#1aab98",
          600: "#138a7b",
          700: "#106e63",
        },
      },
      fontFamily: {
        display: ["\"Fraunces\"", "Georgia", "serif"],
        body: ["\"Inter\"", "system-ui", "sans-serif"],
        data: ["\"IBM Plex Mono\"", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #5532d6 0%, #6d4de8 38%, #1aab98 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, #f2f1fe 0%, #eafbf8 100%)",
      },
    },
  },
  plugins: [],
};
