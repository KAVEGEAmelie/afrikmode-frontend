/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{html,ts}",
    ],
    theme: {
      extend: {
        colors: {
          // Couleurs AfrikMode selon le cahier des charges
          primary: {
            DEFAULT: '#8B2E2E', // Rouge-brun
            light: '#A54343',
            dark: '#6B2424',
          },
          secondary: {
            DEFAULT: '#D9744F', // Orange
            light: '#E89272',
            dark: '#C05A37',
          },
          accent: {
            DEFAULT: '#6B8E23', // Vert sauge
            light: '#88AB3E',
            dark: '#556F1C',
          },
          neutral: {
            beige: '#F5E4D7',
            cream: '#FFF9F6',
            gray: '#3A3A3A',
          }
        },
        fontFamily: {
          display: ['Merriweather', 'serif'], // Titres
          body: ['Inter', 'Roboto', 'sans-serif'], // Textes
        },
      },
    },
    plugins: [],
  }