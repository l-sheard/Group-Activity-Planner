/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#fdf6ec",
        "bg-tint": "#f7eedc",
        surface: "#ffffff",
        border: "#f1e6d0",
        "border-strong": "#e6d6b5",
        text: "#3a2f2a",
        muted: "#9a8a7d",
        accent: "#2c2540",
        "accent-dark": "#1d1730",
        "accent-soft": "#f4ecff",
        danger: "#d14b4b",
        pastel: {
          "lavender-bg": "#ece4ff",
          "lavender-fg": "#6b4ce6",
          "mint-bg": "#dbf5e3",
          "mint-fg": "#1f8a4f",
          "peach-bg": "#ffe1cf",
          "peach-fg": "#c25a14",
          "pink-bg": "#ffd9e6",
          "pink-fg": "#c2185b",
          "sky-bg": "#d8ecf7",
          "sky-fg": "#1a7195",
          "sand-bg": "#efe7da",
          "sand-fg": "#7a6a55",
        },
      },
      fontFamily: {
        sans: [
          "Quicksand",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        DEFAULT: "14px",
        lg: "20px",
      },
      boxShadow: {
        card: "0 2px 4px rgba(58,47,42,.04), 0 8px 24px rgba(58,47,42,.06)",
      },
    },
  },
  plugins: [],
};
