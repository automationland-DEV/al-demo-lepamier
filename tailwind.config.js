/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5d9e1",
          300: "#b1b9c8",
          400: "#8792a8",
          500: "#67738b",
          600: "#525c72",
          700: "#434b5c",
          800: "#3a414f",
          900: "#1f2531",
          950: "#0f1218",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        display: ['"Plus Jakarta Sans"', "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 18, 24, 0.04), 0 4px 12px rgba(15, 18, 24, 0.04)",
        pop: "0 10px 30px rgba(7, 40, 73, 0.12)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e3a8a 100%)",
        "soft-grid":
          "radial-gradient(circle at 1px 1px, rgba(15,18,24,0.06) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};