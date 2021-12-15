const base = require('../../jest.config.js');
const pkg = require('./package.json');

module.exports = {
  ...base,
  name: pkg.name,
  displayName: pkg.name,
};
