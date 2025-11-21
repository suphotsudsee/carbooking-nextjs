import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-kanit)", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#0d6efd",
          foreground: "#ffffff",
        },
      },
    },
  },
  plugins: [],
};

export default config;
