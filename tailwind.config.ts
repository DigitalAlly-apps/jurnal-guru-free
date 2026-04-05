import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["Geist", "Inter", "-apple-system", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "monospace"],
      },
      colors: {
        border:    "hsl(var(--border))",
        "border-2": "hsl(var(--border-2))",
        input:     "hsl(var(--input))",
        ring:      "hsl(var(--ring))",
        background: "hsl(var(--bg))",
        "bg-2":    "hsl(var(--bg-2))",
        "bg-3":    "hsl(var(--bg-3))",
        foreground: "hsl(var(--text))",
        surface:   "hsl(var(--surface))",
        "text-primary":   "hsl(var(--text))",
        "text-secondary": "hsl(var(--text-2))",
        "text-tertiary":  "hsl(var(--text-3))",
        primary: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--primary-foreground))",
          light:      "hsl(var(--accent-light))",
          hover:      "hsl(var(--accent-hover))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--red))",
          foreground: "hsl(0 0% 100%)",
          light:      "hsl(var(--red-light))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--primary-foreground))",
          light:      "hsl(var(--accent-light))",
          hover:      "hsl(var(--accent-hover))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        semantic: {
          red:           "hsl(var(--red))",
          "red-light":   "hsl(var(--red-light))",
          yellow:        "hsl(var(--yellow))",
          "yellow-light":"hsl(var(--yellow-light))",
          blue:          "hsl(var(--blue))",
          "blue-light":  "hsl(var(--blue-light))",
          green:         "hsl(var(--green))",
          "green-light": "hsl(var(--green-light))",
          purple:        "hsl(var(--purple))",
          "purple-light":"hsl(var(--purple-light))",
        },
        sidebar: {
          DEFAULT:              "hsl(var(--sidebar-background))",
          foreground:           "hsl(var(--sidebar-foreground))",
          primary:              "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent:               "hsl(var(--sidebar-accent))",
          "accent-foreground":  "hsl(var(--sidebar-accent-foreground))",
          border:               "hsl(var(--sidebar-border))",
          ring:                 "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        "2xl": "var(--radius-xl)",
        xl:    "var(--radius-xl)",
        lg:    "var(--radius-lg)",
        md:    "var(--radius)",
        sm:    "var(--radius-sm)",
      },
      boxShadow: {
        soft:       "var(--shadow-soft)",
        "soft-md":  "var(--shadow-md)",
        "soft-lg":  "var(--shadow-lg)",
        accent:     "var(--shadow-accent)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fab-in": {
          from: { opacity: "0", transform: "scale(0.85) translateY(8px)" },
          to:   { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "fab-out": {
          from: { opacity: "1", transform: "scale(1) translateY(0)" },
          to:   { opacity: "0", transform: "scale(0.85) translateY(8px)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fab-in":         "fab-in 0.2s ease-out forwards",
        "fab-out":        "fab-out 0.15s ease-in forwards",
        "slide-in":       "slide-in 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
