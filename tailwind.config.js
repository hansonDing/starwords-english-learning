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
        // StarWords custom colors
        "space-navy": "#0B1D3A",
        "nebula-purple": "#7B68EE",
        "nebula-purple-light": "#9B8AF4",
        "star-gold": "#FFD700",
        "star-gold-light": "#FCD34D",
        "star-gold-dark": "#FFA500",
        "soft-white": "#F8F9FC",
        "coral-red": "#FF6B6B",
        "emerald-green": "#34D399",
        "emerald-green-light": "#6EE7B7",
        "sky-blue": "#38BDF8",
        "sky-blue-light": "#7DD3FC",
        "galaxy-pink": "#F472B6",
        "galaxy-pink-light": "#F9A8D4",
        "light-gray": "#E5E7EB",
        "dark-gray": "#6B7280",
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
        "noto-sc": ['"Noto Sans SC"', 'sans-serif'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
        "2xl": "32px",
        full: "9999px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        sm: "0 2px 8px rgba(123, 104, 238, 0.15)",
        md: "0 4px 16px rgba(123, 104, 238, 0.2)",
        lg: "0 8px 32px rgba(123, 104, 238, 0.25)",
        glow: "0 0 40px rgba(255, 215, 0, 0.3)",
        "error-glow": "0 0 20px rgba(255, 107, 107, 0.4)",
        "success-glow": "0 0 20px rgba(52, 211, 153, 0.4)",
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
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.5", boxShadow: "0 0 20px rgba(123, 104, 238, 0.3)" },
          "50%": { opacity: "1", boxShadow: "0 0 40px rgba(123, 104, 238, 0.6)" },
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
        float: "float 3s ease-in-out infinite",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
        shimmer: "shimmer 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
