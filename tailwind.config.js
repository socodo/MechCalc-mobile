/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Semantic colors - sử dụng CSS variables cho dark mode
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",

        primary: {
          DEFAULT: "#0a7ea4",
          foreground: "#ffffff",
        },

        muted: {
          DEFAULT: "#f4f4f5",
          foreground: "#71717a",
        },

        // App-specific colors
        icon: {
          DEFAULT: "var(--color-icon)",
          muted: "var(--color-icon-muted)",
        },
      },
    },
  },
  plugins: [],
};
