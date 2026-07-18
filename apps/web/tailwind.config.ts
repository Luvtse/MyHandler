import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      /* ── Brand Fonts ─────────────────────────────────────── */
      fontFamily: {
        sans:  ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono:  ["JetBrains Mono", "ui-monospace", "monospace"],
      },

      /* ── Color System ────────────────────────────────────── */
      colors: {
        /* shadcn/radix tokens (CSS-variable driven) */
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        /* GoodsHandler brand palette (static HEX) */
        brand: {
          DEFAULT: "#1A3C8F",   /* Bold Blue — primary */
          mid:     "#2756C5",   /* Mid Blue  — hover/interactive */
          dark:    "#122B6E",   /* Dark Blue — pressed / deep bg */
          light:   "#E8EFFE",   /* Blue tint — backgrounds, chips */
          50:      "#EFF4FF",
          100:     "#DCE8FF",
          200:     "#BAD0FF",
          300:     "#84AEFF",
          400:     "#4D82FF",
          500:     "#2756C5",
          600:     "#1A3C8F",   /* DEFAULT */
          700:     "#14307A",
          800:     "#122B6E",
          900:     "#0C1D4A",
        },
        yellow: {
          DEFAULT: "#FFC107",   /* Bold Yellow — accent / CTA */
          dark:    "#E5A900",   /* Yellow hover */
          light:   "#FFF8E1",   /* Yellow tint */
          50:      "#FFFDE7",
          100:     "#FFF8C4",
          200:     "#FFF08A",
          300:     "#FFE24A",
          400:     "#FFCF14",
          500:     "#FFC107",   /* DEFAULT */
          600:     "#E5A900",
          700:     "#B07D00",
          800:     "#7A5300",
          900:     "#3D2800",
        },

        /* Logistics semantic shortcuts */
        logistics: {
          blue:   "#1A3C8F",
          yellow: "#FFC107",
          gray:   "#64748B",
        },

        /* Sidebar tokens */
        sidebar: {
          DEFAULT:            "hsl(var(--sidebar-background))",
          foreground:         "hsl(var(--sidebar-foreground))",
          primary:            "hsl(var(--sidebar-primary))",
          "primary-foreground":"hsl(var(--sidebar-primary-foreground))",
          accent:             "hsl(var(--sidebar-accent))",
          "accent-foreground":"hsl(var(--sidebar-accent-foreground))",
          border:             "hsl(var(--sidebar-border))",
          ring:               "hsl(var(--sidebar-ring))",
        },
      },

      /* ── Border Radius ───────────────────────────────────── */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      /* ── Keyframes ───────────────────────────────────────── */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%":   { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-yellow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,193,7,0.4)" },
          "50%":       { boxShadow: "0 0 0 8px rgba(255,193,7,0)" },
        },
      },
      animation: {
        "accordion-down":  "accordion-down 0.2s ease-out",
        "accordion-up":    "accordion-up 0.2s ease-out",
        "fade-in":         "fade-in 0.5s ease-out forwards",
        "slide-in-right":  "slide-in-right 0.4s ease-out forwards",
        "pulse-yellow":    "pulse-yellow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
