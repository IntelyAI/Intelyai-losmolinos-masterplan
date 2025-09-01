/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'lot-hover': 'rgba(59, 130, 246, 0.3)',
        'lot-selected': 'rgba(37, 99, 235, 0.8)',
      },
    },
  },
  plugins: [],
}


