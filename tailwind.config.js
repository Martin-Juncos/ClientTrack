/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        copy: "rgb(var(--color-copy) / <alpha-value>)",
        subtle: "rgb(var(--color-subtle) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        accent2: "rgb(var(--color-accent-2) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warn: "rgb(var(--color-warn) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)"
      },
      fontFamily: {
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        panel: "0 20px 60px rgba(7, 15, 28, 0.45)",
        glow: "0 0 0 1px rgba(34, 211, 238, 0.2), 0 16px 48px rgba(59, 130, 246, 0.18)"
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at top left, rgba(34,211,238,0.16), transparent 30%), radial-gradient(circle at top right, rgba(99,102,241,0.14), transparent 28%), linear-gradient(180deg, rgba(13,18,32,0.98) 0%, rgba(6,10,20,1) 100%)"
      }
    }
  },
  plugins: []
};
