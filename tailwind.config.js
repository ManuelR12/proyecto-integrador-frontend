/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-22px)' },
        },
        'float-alt': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-16px) rotate(4deg)' },
          '66%': { transform: 'translateY(8px) rotate(-3deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.15', transform: 'scale(1)' },
          '50%': { opacity: '0.45', transform: 'scale(1.15)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(22px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'page-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'page-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'float': 'float 7s ease-in-out infinite',
        'float-alt': 'float-alt 10s ease-in-out infinite',
        'float-delay': 'float 7s ease-in-out 3.5s infinite',
        'float-delay-alt': 'float-alt 10s ease-in-out 5s infinite',
        'pulse-glow': 'pulse-glow 5s ease-in-out infinite',
        'pulse-glow-delay': 'pulse-glow 5s ease-in-out 2.5s infinite',
        'fade-up': 'fade-up 0.7s ease-out both',
        'page-in': 'page-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        'page-out': 'page-out 0.2s ease-in both',
      },
    },
  },
  plugins: [],
}
