import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        "virus-green": "#39ff14",
        "virus-green-dim": "#1a8a0a",
        "virus-dark": "#0a1f02",
        "virus-glow": "rgba(57, 255, 20, 0.3)",
        "card-bg": "rgba(10, 31, 2, 0.6)",
        "card-border": "rgba(57, 255, 20, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
