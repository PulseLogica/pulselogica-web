import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "bg-deep": "#020408",
        "bg-mid": "#0A0F1D",
        amber: "#FF7A00",
        "amber-soft": "rgba(255,122,0,.15)",
        cream: "#F8F9FA",
        // brand guide restricts this to internal/dev UI — never on the public marketing site
        "tech-cyan": "#00E5FF",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
