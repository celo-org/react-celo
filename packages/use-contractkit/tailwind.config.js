module.exports = {
  prefix: 'tw-',
  important: true,
  purge: ['./src/**/*.{js,jsx,tsx}'],
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
