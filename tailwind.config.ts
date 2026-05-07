import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-muted": "rgb(var(--surface-muted) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        "border-strong": "rgb(var(--border-strong) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
        "text-subtle": "rgb(var(--text-subtle) / <alpha-value>)",
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
          hover: "rgb(var(--brand-hover) / <alpha-value>)",
          fg: "rgb(var(--brand-fg) / <alpha-value>)",
        },
        severity: {
          critical: "rgb(var(--severity-critical) / <alpha-value>)",
          high: "rgb(var(--severity-high) / <alpha-value>)",
          medium: "rgb(var(--severity-medium) / <alpha-value>)",
          low: "rgb(var(--severity-low) / <alpha-value>)",
          "critical-bg": "rgb(var(--severity-critical-bg) / <alpha-value>)",
          "high-bg": "rgb(var(--severity-high-bg) / <alpha-value>)",
          "medium-bg": "rgb(var(--severity-medium-bg) / <alpha-value>)",
          "low-bg": "rgb(var(--severity-low-bg) / <alpha-value>)",
        },
        state: {
          patched: "rgb(var(--state-patched) / <alpha-value>)",
          acknowledged: "rgb(var(--state-acknowledged) / <alpha-value>)",
          ignored: "rgb(var(--state-ignored) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
