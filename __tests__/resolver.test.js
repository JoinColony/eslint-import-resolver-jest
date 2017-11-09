/* eslint-env jest */

var jestResolver = require('..');
var path = require('path');
var fs = require('fs');

jest.mock('find-root', () => jest.fn(() => ""));

jest.mock('path', () => {
  var path = require.requireActual('path');
  jest.spyOn(path, 'resolve');
  return path;
});

jest.mock('fs', () => {
  var fs = require.requireActual('fs');
  jest.spyOn(fs, 'existsSync');
  return fs;
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

test('Resolves when <rootDir> is in testMatch', () => {
  path.resolve.mockImplementationOnce(() => {
    return './__tests__/package.rootdir.mock.json';
  });

  const result = jestResolver.resolve('resolveme/resolved.js', 'test/unit/iamtest.js');
  expect(result).toEqual({
    found: true,
    path: `${process.cwd()}/src/resolved.js`
  });
});

test('Resolves when source has no extension but can be found with moduleFileExtensions', () => {
  // someJsonFile.js
  // someJsonFile/index.js
  // someJsonFile.json
  fs.existsSync.mockImplementation((path) => path.endsWith('someJsonFile.json'));

  const result = jestResolver.resolve('resolveme/someJsonFile', '__tests__/iamtest.js', {
    jestConfigFile: '__tests__/jest.config.no-extension.mock.json'
  });

  expect(result).toEqual({
    found: true,
    path: `${process.cwd()}/src/someJsonFile.json`
  });
});

test('Resolves index of source when no extension provided but can be found with moduleFileExtensions', () => {
  // someFile.js
  // someFile/index.js
  fs.existsSync.mockImplementation((path) => path.endsWith('someFile/index.js'));

  const result = jestResolver.resolve('resolveme/someFile', '__tests__/iamtest.js', {
    jestConfigFile: '__tests__/jest.config.no-extension.mock.json'
  });

  expect(result).toEqual({
    found: true,
    path: `${process.cwd()}/src/someFile/index.js`
  });
});

test('Does not resolve when source has no extension and the file cannot be found with moduleFileExtensions', () => {
  // fileDoesNotExist.js
  // fileDoesNotExist/index.js
  // fileDoesNotExist.json
  // fileDoesNotExist/index.json
  fs.existsSync.mockImplementation(() => false);

  const result = jestResolver.resolve('resolveme/fileDoesNotExist', '__tests__/iamtest.js', {
    jestConfigFile: '__tests__/jest.config.no-extension.mock.json'
  });

  expect(result).toEqual({
    found: false
  });
});

test('Resolves modules defined with the moduleDirectories option', () => {
  fs.existsSync.mockImplementation((path) => path.endsWith('custom_modules/coolcustommodule'));

  const result = jestResolver.resolve('coolcustommodule', '__tests__/iamtest.js', {
    jestConfigFile: '__tests__/jest.config.moduleDirectories.json'
  });

  expect(result).toEqual({
    found: true,
    path: `${process.cwd()}/custom_modules/coolcustommodule`
  });
});
