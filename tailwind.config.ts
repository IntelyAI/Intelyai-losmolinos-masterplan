import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Colores personalizados para los lotes
                'lot-hover': 'rgba(59, 130, 246, 0.3)', // Azul con transparencia para hover
                'lot-selected': 'rgba(37, 99, 235, 0.8)', // Azul más fuerte para selección
            },
        },
    },
    plugins: [],
};

export default config;
