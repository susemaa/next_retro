import type { Config } from "tailwindcss";

export const toastDurationMS = 3000;

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    listStyleType: {
      circle: "circle",
      disc: "disc",
    },
    keyframes: {
      "slide-bottom": {
        "0%": { transform: "translateY(100%)", opacity: "0" },
        "25%": { transform: "translateY(0)", opacity: "1" },
        "75%": { transform: "translateY(0)", opacity: "1" },
        "100%": { transform: "translateY(100%)", opacity: "0" },
      },
    },
    animation: {
      "slide-in-out-bottom": `slide-bottom ${toastDurationMS / 1000}s forwards`,
    },
  },
  plugins: [
    require("daisyui"),
  ],
};
export default config;
