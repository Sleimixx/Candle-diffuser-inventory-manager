import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        line: {
          purple: "#a78bfa",
          lightblue: "#7dd3fc",
          red: "#ef4444",
          green: "#22c55e",
          yellow: "#eab308",
          grey: "#9ca3af",
          pink: "#f9a8d4",
        },
      },
    },
  },
  plugins: [],
};

export default config;
