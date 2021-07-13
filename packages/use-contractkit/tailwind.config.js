module.exports = {
  prefix: 'tw-',
  important: true,
  purge: {
    enabled: true,
    preserveHtmlElements: false,
    content: ['./src/**/*.{js,jsx,tsx}'],
    options: {
      safelist: ['dark', 'tw-dark'],
    },
  },
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
