/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366f1', // Indigo 500
                    hover: '#4f46e5',   // Indigo 600
                },
                slate: {
                    darker: '#0f172a',          // Slate 900
                    dark: 'rgba(30, 41, 59, 0.7)', // Slate 800 + opacity
                    normal: '#94a3b8',          // Slate 400
                    light: '#f8fafc',           // Slate 50
                },
                accent: '#10b981', // Emerald 500
                danger: '#ef4444', // Red 500
                warning: '#f59e0b', // Amber 500
                info: '#60a5fa',   // Blue 400
            },
        },
    },
    plugins: [],
}
