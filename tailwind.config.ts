import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary Brand Color: #03203d (Deep Navy)
        primary: {
          50: "#f0f5fa",
          100: "#e0ebf5",
          200: "#c2d6ea",
          300: "#94b9dc",
          400: "#5e96cb",
          500: "#3878b6",
          600: "#265d96",
          700: "#1d4b79",
          800: "#03203d", // Main Primary Color
          900: "#02172d",
          950: "#010f1e",
          DEFAULT: "#03203d",
        },
        // Secondary Brand Color: #c9932a (Warm Gold)
        secondary: {
          50: "#fbf8f0",
          100: "#f6eedb",
          200: "#ecdbb6",
          300: "#e0c489",
          400: "#d4ad5b",
          500: "#c9932a", // Main Secondary Color
          600: "#b47c21",
          700: "#915c1c",
          800: "#764a1c",
          900: "#633e1c",
          950: "#39200c",
          DEFAULT: "#c9932a",
        },
        // Mapped to Primary #03203d for seamless backwards compatibility
        petroleum: {
          50: "#f0f5fa",
          100: "#e0ebf5",
          200: "#c2d6ea",
          300: "#94b9dc",
          400: "#5e96cb",
          500: "#3878b6",
          600: "#265d96",
          700: "#1d4b79",
          800: "#03203d", // Primary Brand
          900: "#02172d",
          950: "#010f1e",
          DEFAULT: "#03203d",
        },
        // Gold palette alias
        gold: {
          50: "#fbf8f0",
          100: "#f6eedb",
          200: "#ecdbb6",
          300: "#e0c489",
          400: "#d4ad5b",
          500: "#c9932a", // Secondary Gold
          600: "#b47c21",
          700: "#915c1c",
          800: "#764a1c",
          900: "#633e1c",
          950: "#39200c",
          DEFAULT: "#c9932a",
        },
        warm: {
          50: "#fcfbf9",
          100: "#f7f5f0",
          200: "#efece4",
          300: "#e2ded2",
          400: "#c9932a", // Secondary Gold Accent
          500: "#b47c21",
          600: "#915c1c",
          800: "#38332a",
          900: "#242019",
          950: "#15130f",
        },
        graphite: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },

      fontFamily: {
        sans: [
          "var(--font-sans)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
