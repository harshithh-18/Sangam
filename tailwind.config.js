/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#0a1220",
          900: "#0f1a2e",
          850: "#13223b",
          800: "#182a48",
          700: "#20375c",
          600: "#2b4a78",
        },
        brand: {
          50: "#eafaf3",
          100: "#c9f2df",
          200: "#95e6c1",
          300: "#57d3a0",
          400: "#22b880",
          500: "#0f9d6a",
          600: "#0a7d55",
          700: "#0a6446",
          800: "#0b503a",
          900: "#0a4231",
        },
        aqua: {
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
        },
      },
      boxShadow: {
        panel: "0 8px 30px rgba(2, 8, 20, 0.35)",
        card: "0 1px 3px rgba(2,8,20,0.25), 0 8px 24px rgba(2,8,20,0.20)",
      },
    },
  },
  plugins: [],
};
