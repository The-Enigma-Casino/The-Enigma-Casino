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
      },
      fontFamily: {
        reddit: ['Reddit Sans', 'sans-serif'],
      },
    },
  },
  corePlugins: {
    preflight: true,
  },
  plugins: [],
}
