module.exports = {
  prefix: 'tw-',
  important: true,
  content: ['./src/**/*.{js,jsx,tsx}'],
  safelist: ['dark', 'tw-dark'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      borderWidth: ['last'],
    },
  },
  plugins: [],
};
