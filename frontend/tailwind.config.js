/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed' },
        mint: { 400: '#34d399', 500: '#10b981' },
      },
      boxShadow: { glow: '0 0 40px -8px rgba(139,92,246,0.55)' },
      keyframes: {
        pop: { '0%': { opacity: 0, transform: 'translateY(8px) scale(.98)' }, '100%': { opacity: 1, transform: 'none' } },
      },
      animation: { pop: 'pop .25s ease-out' },
    },
  },
  plugins: [],
}
