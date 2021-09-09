/* eslint-env jest */
/* eslint max-len: 0, import/no-unresolved: 0 */

jest.mock('find-root', () => jest.fn(() => '/path/to/project'));

jest.mock('path', () => {
  const mockPath = require.requireActual('path');
  jest.spyOn(mockPath, 'resolve');
  return mockPath;
});

jest.mock('fs', () => {
  const mockFs = require.requireActual('fs');
  jest.spyOn(mockFs, 'existsSync');
  return mockFs;
});

const resolve = require('resolve');
const path = require('path');
const createSandbox = require('jest-sandbox');
const jestResolver = require('../index.js');

const DEFAULT_EXTENSIONS = ['.js', '.json', '.jsx', '.node'];
const DEFAULT_DIRECTORIES = ['node_modules'];

const DEFAULT_RESOLVER_SETTINGS = {
  basedir: '/path/to/project/__tests__',
  extensions: DEFAULT_EXTENSIONS,
  moduleDirectory: DEFAULT_DIRECTORIES,
  paths: [],
};

describe('Jest resolver', () => {
  const sandbox = createSandbox();

  sandbox.spyOn(resolve, 'sync');
  afterEach(() => sandbox.clear());

  test('Get jest config from package.json', () => {
    path.resolve.mockImplementationOnce(() => './__tests__/package.mock.json');

    jestResolver.resolve(
      'resolveme',
      '/path/to/project/__tests__/iamtest.test.js'
    );
    expect(resolve.sync).toHaveBeenCalledWith(
      '/path/to/project/src/resolved.js',
      DEFAULT_RESOLVER_SETTINGS
    );
  });

  test('Get jest config from js file using absolute path for rootDir', () => {
    path.resolve.mockImplementationOnce(() => './__tests__/jest.config.js');

    jestResolver.resolve(
      '@/resolveme',
      '/path/to/project/__tests__/iamtest.test.js',
      {
        jestConfigFile: '__tests__/jest.config.js',
      }
    );
    expect(resolve.sync).toHaveBeenCalledWith(
      '/custom/path/to/my/project/src/resolveme',
      DEFAULT_RESOLVER_SETTINGS
    );
  });

  test('Returns proper eslint-import-resolver object', () => {
    path.resolve.mockImplementationOnce(
      () => './__tests__/package.regex.mock.json'
    );

    resolve.sync.mockImplementationOnce(
      () => '/path/to/project/src/resolved.js'
    );

    const result = jestResolver.resolve(
      'test-dir/resolved',
      '/path/to/project/__tests__/iamtest.test.js'
    );
    expect(result).toEqual({
      found: true,
      path: '/path/to/project/src/resolved.js',
    });
  });

  test('Resolves when moduleNameMapper uses regex and <rootDir>', () => {
    path.resolve.mockImplementationOnce(
      () => './__tests__/package.regex.mock.json'
    );

    jestResolver.resolve(
      'test-dir/resolved',
      '/path/to/project/__tests__/iamtest.test.js'
    );
    expect(resolve.sync).toHaveBeenCalledWith(
      '/path/to/project/src/resolved.js',
      DEFAULT_RESOLVER_SETTINGS
    );
  });

  test('Does not resolve when it is not a test', () => {
    path.resolve.mockImplementationOnce(() => './__tests__/package.mock.json');
    const result = jestResolver.resolve(
      'resolveme',
      '/path/to/project/src/iamprodcode.js'
    );
    expect(result).toEqual({
      found: false,
    });
  });

  test('Works with external jest config file and testRegex', () => {
    path.resolve.mockImplementationOnce(
      () => './__tests__/jest.config.mock.json'
    );
    jestResolver.resolve(
      'jestconfigresolve',
      '/path/to/project/__testsconfig__/iamtest.js',
      {
        jestConfigFile: '__tests__/jest.config.mock.json',
      }
    );
    expect(resolve.sync).toHaveBeenCalledWith(
      '/path/to/project/src/resolved.js',
      {
        ...DEFAULT_RESOLVER_SETTINGS,
        basedir: '/path/to/project/__testsconfig__',
      }
    );
  });

  test('Does not resolve when source is not in moduleNameMapper', () => {
    path.resolve.mockImplementationOnce(
      () => './__tests__/jest.config.mock.json'
    );
    const result = jestResolver.resolve(
      'doesnotresolve',
      '/path/to/project/__testsconfig__/iamtest.js',
      {
        jestConfigFile: '__tests__/jest.config.mock.json',
      }
    );
    expect(result).toEqual({
      found: false,
    });
  });

  test('Apply default test matching pattern when not given and works with rootDir', () => {
    path.resolve.mockImplementationOnce(
      () => './__tests__/jest.config.min.mock.json'
    );
    jestResolver.resolve('resolveme', '/path/to/project/__tests__/iamtest.js', {
      jestConfigFile: '__tests__/jest.config.min.mock.json',
    });
    expect(resolve.sync).toHaveBeenCalledWith(
      '/path/to/project/src/resolved.js',
      DEFAULT_RESOLVER_SETTINGS
    );
  });

  test('Resolves Node core modules properly', () => {
    path.resolve.mockImplementationOnce(
      () => './__tests__/package.regex.mock.json'
    );
    const result = jestResolver.resolve(
      'fs',
      '/path/to/project/__testsconfig__/iamtest.js'
    );
    expect(result).toEqual({
      found: true,
      path: undefined,
    });
  });

  test('Does not do anything without config', () => {
    path.resolve.mockImplementationOnce(
      () => './__tests__/jest.config.none.mock.json'
    );
    const result = jestResolver.resolve(
      'resolveme',
      '/path/to/project/__tests__/iamtest.js',
      {
        jestConfigFile: '__tests__/jest.config.none.mock.json',
      }
    );
    expect(result).toEqual({
      found: false,
    });
  });

  test('Throws when specified config file does not exist', () => {
    expect(() => {
      jestResolver.resolve(
        'resolveme',
        '/path/to/project/__tests__/iamtest.js',
        {
          jestConfigFile: '__tests__/idonotexist.json',
        }
      );
    }).toThrow(/not\sfound/);
  });

  test('Resolves when <rootDir> is in testMatch', () => {
    path.resolve.mockImplementationOnce(
      () => './__tests__/package.rootdir.mock.json'
    );
    jestResolver.resolve(
      'resolveme/resolved.js',
      '/path/to/project/test/unit/iamtest.js'
    );
    expect(resolve.sync).toHaveBeenCalledWith(
      '/path/to/project/src/resolved.js',
      { ...DEFAULT_RESOLVER_SETTINGS, basedir: '/path/to/project/test/unit' }
    );
  });

  test('Passes on moduleFileExtensions properly', () => {
    path.resolve.mockImplementationOnce(
      () => './__tests__/jest.config.no-extension.mock.json'
    );

    jestResolver.resolve(
      'resolveme/someFile',
      '/path/to/project/__tests__/iamtest.js',
      {
        jestConfigFile: '__tests__/jest.config.no-extension.mock.json',
      }
    );

    expect(resolve.sync).toHaveBeenCalledWith('/path/to/project/src/someFile', {
      ...DEFAULT_RESOLVER_SETTINGS,
      extensions: ['.ts'],
    });
  });

  test('Resolves modules defined with the moduleDirectories option', () => {
    path.resolve.mockImplementationOnce(
      () => './__tests__/jest.config.moduleDirectories.json'
    );

    jestResolver.resolve('someFile', '/path/to/project/__tests__/iamtest.js', {
      jestConfigFile: '__tests__/jest.config.moduleDirectories.json',
    });

    expect(resolve.sync).toHaveBeenCalledWith('someFile', {
      ...DEFAULT_RESOLVER_SETTINGS,
      moduleDirectory: ['custom_modules'],
    });
  });

  test('Passes down modulePaths properly', () => {
    path.resolve.mockImplementationOnce(
      () => './__tests__/jest.config.modulePaths.json'
    );

    jestResolver.resolve('someFile', '/path/to/project/__tests__/iamtest.js', {
      jestConfigFile: '__tests__/jest.config.moduleDirectories.json',
    });

    expect(resolve.sync).toHaveBeenCalledWith('someFile', {
      ...DEFAULT_RESOLVER_SETTINGS,
      moduleDirectory: [
        'node_modules',
        '/path/to/my/node_modules',
        '/path/to/project/src/modules',
      ],
    });
  });
});
