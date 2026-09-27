/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // ── Sangam palette (from the logo) — used as accents on light surfaces ──
        brand: {
          50: "#eafaf1",
          100: "#cbeed7",
          200: "#9fdcb1",
          300: "#6fca8b",
          400: "#4fbb6d",
          500: "#37a854",
          600: "#2c8944",
          700: "#247038",
          800: "#1e5c30",
          900: "#184b28",
        },
        aqua: {
          50: "#eaf4fb",
          100: "#cfe6f6",
          200: "#a6d0ee",
          300: "#7cc0ec",
          400: "#4a9bd8",
          500: "#2379c4",
          600: "#1c62a3",
          700: "#184f83",
        },
        teal: {
          50: "#e7f6f8",
          100: "#c4e9ed",
          200: "#96d6de",
          300: "#7fd3dd",
          400: "#3fb2c1",
          500: "#1a92a4",
          600: "#147687",
          700: "#105f6d",
        },
        orange: {
          50: "#fdf1e2",
          100: "#f9dcbb",
          300: "#f6bd77",
          400: "#f0a23f",
          500: "#ea8b1f",
          600: "#c97414",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.05), 0 1px 3px rgba(16,24,40,0.10)",
        lift: "0 10px 28px rgba(16,24,40,0.12)",
        panel: "0 6px 24px rgba(16,24,40,0.10)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.5s ease both",
      },
    },
  },
  plugins: [],
};
