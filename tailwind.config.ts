import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16192B",
        paper: "#FAF7F2",
        pulse: "#E8785A",
        logic: "#4FB6A8",
        muted: "#7A7568",
        line: "#E4DDD0",
      },
      fontFamily: {
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
        serif: ["var(--font-source-serif)", "Source Serif 4", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
