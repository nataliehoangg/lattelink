/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Editorial café palette
        cream: '#F8F5F1',
        'deep-coffee': '#2D241F',
        mocha: '#A27C5E',
        'mist-gray': '#E2DED9',
        'pale-latte': '#EBDCCB',
        espresso: '#5C4431',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Fallback for Neue Haas Grotesk
        serif: ['Georgia', 'Times New Roman', 'serif'], // Fallback for Canela
        display: ['Inter', 'system-ui', 'sans-serif'], // For headers
      },
      fontSize: {
        'editorial-h1': ['64px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'editorial-h2': ['40px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'editorial-body': ['18px', { lineHeight: '1.6' }],
        'editorial-caption': ['14px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
      },
      spacing: {
        'editorial-margin': '5%',
        'editorial-gap': '2rem',
      },
      transitionDuration: {
        'slow-drip': '400ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'hover-lift': 'hoverLift 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        hoverLift: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
}

