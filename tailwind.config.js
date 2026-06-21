/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1220",
        panel: "#121B2E",
        panel2: "#16213A",
        hairline: "#25324A",
        amber: { DEFAULT: "#F5A623", dim: "#8A6420" },
        teal: { DEFAULT: "#2DD4BF", dim: "#1B6F66" },
        danger: "#F2545B",
        ink2: "#7C8AA8",
      },
      fontFamily: {
        display: [
          "Avenir Next",
          "Segoe UI",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        body: ["ui-sans-serif", "system-ui", "Segoe UI", "Helvetica Neue", "sans-serif"],
        mono: [
          "ui-monospace",
          "SF Mono",
          "Cascadia Code",
          "Roboto Mono",
          "Consolas",
          "monospace",
        ],
      },
      backgroundImage: {
        isobar: "url('/isobar.svg')",
      },
    },
  },
  plugins: [],
};
