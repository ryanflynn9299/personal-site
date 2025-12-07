import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-open-sans)"],
        heading: ["var(--font-montserrat)"],
      },
      colors: {
        slate: {
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
        sky: {
          300: "#7dd3fc", // Corrected accessible accent
          400: "#38bdf8",
          600: "#0284c7",
          700: "#0369a1",
        },
      },
      typography: (theme: (arg0: string) => any) => ({
        DEFAULT: {
          css: {
            color: theme("colors.slate.200"),
            a: {
              color: theme("colors.sky.300"),
              "&:hover": {
                color: theme("colors.sky.400"),
              },
            },
            h1: {
              color: theme("colors.slate.50"),
              fontFamily: theme("fontFamily.heading"),
            },
            h2: {
              color: theme("colors.slate.50"),
              fontFamily: theme("fontFamily.heading"),
            },
            h3: {
              color: theme("colors.slate.50"),
              fontFamily: theme("fontFamily.heading"),
            },
            h4: {
              color: theme("colors.slate.50"),
              fontFamily: theme("fontFamily.heading"),
            },
            strong: { color: theme("colors.slate.100") },
            code: { color: theme("colors.slate.300") },
            blockquote: {
              color: theme("colors.slate.300"),
              borderLeftColor: theme("colors.slate.700"),
            },
          },
        },
      }),
      animation: {
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
