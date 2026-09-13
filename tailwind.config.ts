import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        foreground: "var(--foreground)",
        "foreground-soft": "var(--foreground-soft)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        origin: "var(--origin)",
        "origin-soft": "var(--origin-soft)",
        eigen: "var(--eigen)",
        warn: "var(--warn)",
        "warn-soft": "var(--warn-soft)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      maxWidth: {
        content: "1080px",
      },
    },
  },
  plugins: [],
};
export default config;
