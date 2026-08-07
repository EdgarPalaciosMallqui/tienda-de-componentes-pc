import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        graphite: {
          DEFAULT: "#14171A",
          surface: "#1C2024",
          border: "#2A2F34",
        },
        paper: "#EDEEF0",
        copper: {
          DEFAULT: "#C77B4A",
          dim: "#8C5836",
        },
        cyan: {
          DEFAULT: "#5FD1C9",
        },
        danger: "#D9634C",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "3px",
      },
    },
  },
  plugins: [],
};

export default config;
