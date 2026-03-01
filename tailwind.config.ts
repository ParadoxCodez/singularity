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
        display: ["Clash Display", "sans-serif"],
        body: ["Satoshi", "sans-serif"],
      },
      colors: {
        background: "#0A0A0F",
        surface: "#111118",
        "surface-2": "#1A1A24",
        border: "rgba(255,255,255,0.06)",
        primary: "#7C3AED",
        "primary-light": "#A855F7",
        "primary-glow": "#C084FC",
        "text-primary": "#F1F0FF",
        "text-muted": "#6B6B8A",
        success: "#34D399",
        danger: "#F87171",
      },
    },
  },
  plugins: [],
};
export default config;
