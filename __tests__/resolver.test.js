var jestResolver = require('..');
var path = require('path');

jest.mock('path', () => {
  var path = require.requireActual('path');
  jest.spyOn(path, 'resolve');
  return path;
});

test('Get jest config from package.json', () => {
  path.resolve.mockImplementationOnce(() => {
    return './__tests__/package.mock.json';
  });
  const result = jestResolver.resolve('resolveme', '__tests__/iamtest.js');
  expect(result).toEqual({
    found: true,
    path: '/src/resolved.js'
  });
});

test('Resolves when moduleNameMapper uses regex and <rootDir>', () => {
  path.resolve.mockImplementationOnce(() => {
    return './__tests__/package.regex.mock.json';
  });
  const result = jestResolver.resolve('test-dir/resolved', '__tests__/iamtest.js');
  expect(result).toEqual({
    found: true,
    path: `${process.cwd()}/src/resolved.js`
  });
});

test('Does not resolve when it is not a test', () => {
  path.resolve.mockImplementationOnce(() => {
    return './__tests__/package.mock.json';
  });
  const result = jestResolver.resolve('resolveme', 'src/iamprodcode.js');
  expect(result).toEqual({
    found: false
  });
});

test('Works with external jest config file and testRegex', () => {
  const result = jestResolver.resolve('jestconfigresolve', '__testsconfig__/iamtest.js', {
    jestConfigFile: '__tests__/jest.config.mock.json'
  });
  expect(result).toEqual({
    found: true,
    path: '/src/resolved.js'
  });
});

test('Does not resolve when source is not in moduleNameMapper', () => {
  const result = jestResolver.resolve('doesnotresolve', '__testsconfig__/iamtest.js', {
    jestConfigFile: '__tests__/jest.config.mock.json'
  });
  expect(result).toEqual({
    found: false
  });
});

test('Apply default test matching pattern when not given and works with rootDir', () => {
  const result = jestResolver.resolve('resolveme', '__tests__/iamtest.js', {
    jestConfigFile: '__tests__/jest.config.min.mock.json'
  });
  expect(result).toEqual({
    found: true,
    path: '/src/resolved.js'
  });
});

test('Does not do anything without moduleNameMapper defined', () => {
  const result = jestResolver.resolve('resolveme', '__tests__/iamtest.js', {
    jestConfigFile: '__tests__/jest.config.none.mock.json'
  });
  expect(result).toEqual({
    found: false
  });
});
