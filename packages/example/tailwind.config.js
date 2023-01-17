module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: '#476520',
        wood: '#655947',
        sand: '#E7E3D4',
        'rc-violet': '#1E002B',
        'rc-violet-light': '#FCF6F1',
        'rc-mist': '#FCF6F1',
        'rc-smog': 'rgba(15,23,42,0.5)',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
