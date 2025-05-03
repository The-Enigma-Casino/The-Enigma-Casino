/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        Principal: '#74c410',
        Coins: '#ffdf31',
        'Background-Chat': '#d4edb5',
        'Background-Overlay': '#2e2e2e',
        'Background-Page': '#0f0f0f',
        'Color-Edit': '#2457c5',
        'Color-Cancel': '#ce2e2e',
        'Green-lines': '#7ff803',
        'Black-color': '#000814',
        'Grey-color': '#505050',
        'Background-nav': '#1c1c1c',
        'Roulette-green': ' #14532d',
        'Roulette-red': '#A91607',
        'Roulette-black': '#0E3811',
      },
      fontFamily: {
        reddit: ['Reddit Sans', 'sans-serif'],
      },
      boxShadow: {
        'custom-white': '0px 8px 16px rgba(255, 255, 255, 0.2), 0px 3px 6px rgba(255, 255, 255, 0.15)',
        'custom-gray': '0px 6px 12px rgba(169, 169, 169, 0.4), 0px 2px 4px rgba(169, 169, 169, 0.3)',
      },
    },
  },
  corePlugins: {
    preflight: true,
  },
  plugins: [],
}
