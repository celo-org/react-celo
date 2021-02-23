module.exports = {
  prefix: 'tw-',
  important: true,
  purge: ['./src/**/*.{js,jsx,tsx}'],
  darkMode: 'media',
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
