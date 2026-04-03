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
        sans: ["Inter", "-apple-system", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        "border-2": "hsl(var(--border-2))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--bg))",
        "bg-2": "hsl(var(--bg-2))",
        "bg-3": "hsl(var(--bg-3))",
        foreground: "hsl(var(--text))",
        surface: "hsl(var(--surface))",
        "text-primary": "hsl(var(--text))",
        "text-secondary": "hsl(var(--text-2))",
        "text-tertiary": "hsl(var(--text-3))",
        primary: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--primary-foreground))",
          light: "hsl(var(--accent-light))",
          hover: "hsl(var(--accent-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--red))",
          foreground: "hsl(0 0% 100%)",
          light: "hsl(var(--red-light))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--primary-foreground))",
          light: "hsl(var(--accent-light))",
          hover: "hsl(var(--accent-hover))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        semantic: {
          red: "hsl(var(--red))",
          "red-light": "hsl(var(--red-light))",
          yellow: "hsl(var(--yellow))",
          "yellow-light": "hsl(var(--yellow-light))",
          blue: "hsl(var(--blue))",
          "blue-light": "hsl(var(--blue-light))",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius)",
        sm: "var(--radius-sm)",
      },
      spacing: {
        "4px": "4px",
        "8px": "8px",
        "12px": "12px",
        "16px": "16px",
        "20px": "20px",
        "24px": "24px",
        "32px": "32px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "spin-slow": "spin-slow 1s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
