import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0d1712",
        forest: "#10241a",
        mint: "#bdedc8",
      },
      boxShadow: {
        glow: "0 0 70px rgba(34, 197, 94, 0.13)",
      },
    },
  },
  plugins: [],
};

export default config;
