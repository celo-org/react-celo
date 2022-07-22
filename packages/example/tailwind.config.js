module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'celo-gold': '#FBCC5C',
        'celo-gold-light': '#fdd679',
        'rc-violet': '#6366f1',
        'rc-violet-light': 'rgb(238, 242, 255)',
        'rc-mist': 'rgba(255,255,255,0.5)',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
