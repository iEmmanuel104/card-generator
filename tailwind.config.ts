import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))'
                },
                'thl-red': '#dc2626',
                'thl-dark': '#0a0a0a',
                'thl-dark-card': '#1a1a1a',
                'thl-dark-border': '#333333',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(220, 38, 38, 0.6)' },
                },
                'diagonal-slide': {
                    '0%': { transform: 'translateX(-100%) rotate(-3deg)', opacity: '0' },
                    '100%': { transform: 'translateX(0) rotate(-3deg)', opacity: '0.2' },
                },
                'bounce-subtle': {
                    '0%, 100%': { transform: 'translateY(0)', opacity: '0.5' },
                    '50%': { transform: 'translateY(8px)', opacity: '1' },
                },
                'particle-float': {
                    '0%, 100%': { transform: 'translateY(0) translateX(0)', opacity: '0.3' },
                    '25%': { transform: 'translateY(-20px) translateX(10px)', opacity: '0.6' },
                    '50%': { transform: 'translateY(-35px) translateX(-5px)', opacity: '0.4' },
                    '75%': { transform: 'translateY(-15px) translateX(15px)', opacity: '0.5' },
                },
                'confetti-burst': {
                    '0%': { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: '1' },
                    '100%': { transform: 'translate(var(--confetti-x), var(--confetti-y)) rotate(var(--confetti-r)) scale(0)', opacity: '0' },
                },
                'ring-pulse': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(220,38,38,0.4)' },
                    '50%': { boxShadow: '0 0 0 8px rgba(220,38,38,0)' },
                },
            },
            animation: {
                marquee: 'marquee 20s linear infinite',
                'fade-in-up': 'fade-in-up 0.5s ease-out',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
                'diagonal-slide': 'diagonal-slide 1s ease-out forwards',
                'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
                'particle-float': 'particle-float 6s ease-in-out infinite',
                'confetti-burst': 'confetti-burst 1s ease-out forwards',
                'ring-pulse': 'ring-pulse 2s ease-in-out infinite',
            },
            fontFamily: {
                dakdo: ['var(--font-dakdo)'],
                inter: ['var(--font-inter)'],
                poppins: ['var(--font-poppins)'],
                playfair: ['var(--font-playfair)'],
                geist: ['var(--font-geist-sans)'],
                mono: ['var(--font-geist-mono)'],
            },
        }
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;
