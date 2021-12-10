module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testRegex: '(/__tests__/.*.(test|spec)).(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: Boolean(process.env.COVERAGE),
  coveragePathIgnorePatterns: ['__tests__', 'lib'],
  verbose: Boolean(process.env.CI),
};
