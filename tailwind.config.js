/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';
import animate from 'tailwindcss-animate';

export default {
    darkMode: ['class'],
    content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            keyframes: {
                floatUp: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                floatUpRight: {
                    '0%, 100%': { transform: 'translate(0, 0) rotate(6deg)' },
                    '50%': { transform: 'translate(10px, -15px) rotate(8deg)' },
                },
                floatDownLeft: {
                    '0%, 100%': { transform: 'translate(0, 0) rotate(-3deg)' },
                    '50%': { transform: 'translate(-8px, 12px) rotate(-5deg)' },
                },
                floatUpLeft: {
                    '0%, 100%': { transform: 'translate(0, 0) rotate(-6deg)' },
                    '50%': { transform: 'translate(-12px, -18px) rotate(-8deg)' },
                },
            },
            animation: {
                'float-1': 'floatUp 4.5s ease-in-out infinite',
                'float-2': 'floatUpRight 5.2s ease-in-out infinite',
                'float-3': 'floatDownLeft 4.8s ease-in-out infinite',
                'float-4': 'floatUpLeft 5.5s ease-in-out infinite',
            },
            colors: {
                background: {
                    DEFAULT: 'hsl(var(--background))',
                    dark: 'hsl(var(--background-dark))',
                },
                foreground: {
                    DEFAULT: 'hsl(var(--foreground))',
                    dark: 'hsl(var(--foreground-dark))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                    dark: 'hsl(var(--card-dark))',
                    'foreground-dark': 'hsl(var(--card-foreground-dark))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                    dark: 'hsl(var(--popover-dark))',
                    'foreground-dark': 'hsl(var(--popover-foreground-dark))',
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                    dark: 'hsl(var(--primary-dark))',
                    'foreground-dark': 'hsl(var(--primary-foreground-dark))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                    dark: 'hsl(var(--secondary-dark))',
                    'foreground-dark': 'hsl(var(--secondary-foreground-dark))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                    dark: 'hsl(var(--muted-dark))',
                    'foreground-dark': 'hsl(var(--muted-foreground-dark))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                    dark: 'hsl(var(--accent-dark))',
                    'foreground-dark': 'hsl(var(--accent-foreground-dark))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                    dark: 'hsl(var(--destructive-dark))',
                    'foreground-dark': 'hsl(var(--destructive-foreground-dark))',
                },
                border: {
                    DEFAULT: 'hsl(var(--border))',
                    dark: 'hsl(var(--border-dark))',
                },
                input: {
                    DEFAULT: 'hsl(var(--input))',
                    dark: 'hsl(var(--input-dark))',
                },
                ring: {
                    DEFAULT: 'hsl(var(--ring))',
                    dark: 'hsl(var(--ring-dark))',
                },
                chart: {
                    1: 'hsl(var(--chart-1))',
                    2: 'hsl(var(--chart-2))',
                    3: 'hsl(var(--chart-3))',
                    4: 'hsl(var(--chart-4))',
                    5: 'hsl(var(--chart-5))',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
        },
    },
    plugins: [typography, animate],
};
