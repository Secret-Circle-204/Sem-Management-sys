/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 5s linear infinite',
        'bounce-slow': 'bounce 10s infinite',
        'ping': 'ping 5s ease-in infinite',
        'pulse-slow': 'pulse 20s ease-in-out infinite',
      },
      boxShadow: {
        '2xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        'spin-slow': {
          to: {
            transform: 'rotate(360deg)',
          },
        },
        'ping': {
          '40%, 70%': {
            transform: 'scale(1.2)',
            opacity: '0.5',
          },
        },
        'pulse-slow': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.5',
          },
        },
        'bounce-slow': {
          '0%, 100%': {
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0.8,0,1,1)',
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0,0,0.2,1)',
          },
        },
      },
      colors: {
        primary: '#FFA500',
        secondary: '#FFC0CB',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      screens: {
        '2xl': '1536px',
        // => @media (min-width: 1536px) { ... }
      },
    },
  },
  plugins: [],
};
