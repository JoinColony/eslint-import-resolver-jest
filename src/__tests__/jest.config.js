/* eslint-disable flowtype/require-valid-file-annotation */

module.exports = {
  rootDir: '/custom/path/to/my/project',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
