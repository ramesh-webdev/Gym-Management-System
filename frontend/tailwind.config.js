/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // KO Fitness Brand Colors
        ko: {
          DEFAULT: "#FF6B00", // Primary Orange
          50: "#fff4ed",
          100: "#ffe4d4",
          200: "#ffc5a8",
          300: "#ff9d71",
          400: "#ff6b00", // Bright Orange
          500: "#FF6B00", // Primary Orange
          600: "#E03B00", // Deep Reddish-Orange
          700: "#b82e00",
          800: "#952500",
          900: "#7a1f00",
        },
        koBlue: {
          DEFAULT: "#004F8C", // Primary Blue
          50: "#e6f2f9",
          100: "#b3d6ed",
          200: "#80bae1",
          300: "#4d9ed5",
          400: "#1a82c9",
          500: "#004F8C", // Primary Blue
          600: "#003f70",
          700: "#002f54",
          800: "#001f38",
          900: "#000f1c",
        },
        // Keep lime for backward compatibility, but map to ko colors
        lime: {
          DEFAULT: "#FF6B00",
          50: "#fff4ed",
          100: "#ffe4d4",
          200: "#ffc5a8",
          300: "#ff9d71",
          400: "#ff6b00",
          500: "#FF6B00",
          600: "#E03B00",
          700: "#b82e00",
          800: "#952500",
          900: "#7a1f00",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        display: ['Teko', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        accent: ['Shadows Into Light', 'cursive'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        glow: "0 0 20px rgba(255, 107, 0, 0.3)",
        "glow-lg": "0 0 40px rgba(255, 107, 0, 0.4)",
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
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
