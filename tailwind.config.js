/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // ── Sangam palette (from the logo) ──
        // `ink`  = navy surfaces, `brand` = logo green, `aqua` = logo blue.
        ink: {
          950: "#07162a",
          900: "#0b1f38",
          850: "#0f2846",
          800: "#143154",
          700: "#1c3f68",
          600: "#27547f",
        },
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
          300: "#7cc0ec",
          400: "#4a9bd8",
          500: "#2379c4",
          600: "#1c62a3",
        },
        teal: {
          300: "#7fd3dd",
          400: "#3fb2c1",
          500: "#1a92a4",
          600: "#147687",
        },
        orange: {
          300: "#f6bd77",
          400: "#f0a23f",
          500: "#ea8b1f",
          600: "#c97414",
        },
      },
      boxShadow: {
        panel: "0 12px 44px rgba(4, 14, 26, 0.5)",
        card: "0 2px 6px rgba(4,14,26,0.28), 0 14px 38px rgba(4,14,26,0.34)",
        glow: "0 0 0 1px rgba(63, 178, 193, 0.30), 0 14px 44px rgba(26, 146, 164, 0.28)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.8s ease both",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
