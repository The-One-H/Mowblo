/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#6BB8D9',
          green: '#7DC46A',
        },
        accent: {
          blue: '#4A9EC4',
          green: '#5BAA48',
        },
        dark: '#1A2332',
        surface: '#F5F8FA',
        gray: {
          light: '#E8EDF2',
          mid: '#9AAAB8',
        },
      },
      fontFamily: {
        display: ['System', 'Nunito-ExtraBold'], // Fallbacks
        headline: ['System', 'Nunito-Bold'],
        body: ['System', 'Nunito-Regular'],
        mono: ['System', 'JetBrains-Mono'],
      }
    },
  },
  plugins: [],
}