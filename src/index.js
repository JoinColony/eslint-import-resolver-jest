/* @flow */

const path = require('path');
const findRoot = require('find-root');
const resolve = require('resolve');

type ResolverConfig = {
  jestConfigFile?: string,
};

type ResolverResult = {
  found: boolean,
  path?: string | null,
};

type JestConfig = {
  importResolverProjectRoot: string,
  moduleDirectories: Array<string>,
  moduleFileExtensions: Array<string>,
  moduleNameMapper: { [string]: string },
  modulePaths: Array<string>,
  rootDir: string,
  testRegex?: string,
  testMatch: Array<string>,
};

type Path = string;

const JEST_ROOT_DIR_PREFIX = '<rootDir>';
const NOTFOUND = { found: false };

// Default values defined by Jest that are required by this resolution process
const JEST_DEFAULT_CONFIG = {
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
  moduleNameMapper: {},
  modulePaths: [],
  rootDir: '',
  testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)(spec|test).js?(x)'],
};

exports.interfaceVersion = 2;

exports.resolve = function resolver(
  source: Path,
  file: Path,
  config?: ResolverConfig
): ResolverResult {
  const jestConfig = getJestConfig(config, file);
  const pathToResolve = applyModuleNameMapper(jestConfig, source) || source;
  const resolvedPath = resolvePath(
    jestConfig,
    path.dirname(file),
    pathToResolve
  );
  if (resolvedPath) {
    return {
      found: true,
      path: resolve.isCore(resolvedPath) ? null : resolvedPath,
    };
  }
  return NOTFOUND;
};

/**
 * Get the Jest configuration required for path resolution.
 * Will use jest configuration from package.json if no jestConfigFile is defined
 * Applies default configuration for any required properties that are undeclared
 */
function getJestConfig(config?: ResolverConfig = {}, file: Path): JestConfig {
  let jestConfig;
  const root = findRoot(file);
  if (config.jestConfigFile) {
    const configFilePath = path.resolve(root, config.jestConfigFile);
    try {
      jestConfig = require(configFilePath);
    } catch (e) {
      throw new Error(`jestConfigFile not found in ${configFilePath}`);
    }
  } else {
    const packageJson = require(path.resolve(root, 'package.json'));
    jestConfig = packageJson.jest;
  }
  if (!jestConfig.testMatch && !jestConfig.testRegex) {
    jestConfig.testMatch = JEST_DEFAULT_CONFIG.testMatch;
  }

  jestConfig.importResolverProjectRoot = root;

  return { ...JEST_DEFAULT_CONFIG, ...jestConfig };
}

/**
 * See whether an import has a corresponding moduleNameMapper, map it and return the path
 */
function applyModuleNameMapper(jestConfig: JestConfig, source: Path): Path {
  const { moduleNameMapper } = jestConfig;
  const moduleNameMappers = Object.keys(moduleNameMapper);
  for (let i = 0; i < moduleNameMappers.length; i += 1) {
    const regex = new RegExp(moduleNameMappers[i]);
    if (regex.test(source)) {
      const targetPath = moduleNameMapper[moduleNameMappers[i]];
      return getAbsolutePath(jestConfig, source.replace(regex, targetPath));
    }
  }
  return '';
}

/**
 * Resolve a module path with a root directory. If no file extension is provided use a list of lookup extensions to append to the path.
 * Will also attempt to resolve to an index file
 * Furthermore it'll look in moduleDirectories, if supplied
 */
function resolvePath(
  jestConfig: JestConfig,
  basedir: Path,
  pathToResolve: Path
): Path {
  const { moduleDirectories, moduleFileExtensions, modulePaths } = jestConfig;
  const absoluteModulePaths = modulePaths.map(mPath =>
    path.isAbsolute(mPath) ? mPath : getAbsolutePath(jestConfig, mPath)
  );
  try {
    return resolve.sync(pathToResolve, {
      basedir,
      extensions: moduleFileExtensions.map(ext => `.${ext}`),
      moduleDirectory: moduleDirectories.concat(absoluteModulePaths),
    });
  } catch (e) {
    return '';
  }
}

/*
 * Get the absolute path of a path, replacing the rootDir if applicable
 */
function getAbsolutePath(jestConfig: JestConfig, filepath: Path): Path {
  const replacedRoot = filepath.replace(
    JEST_ROOT_DIR_PREFIX,
    jestConfig.rootDir
  );
  if (path.isAbsolute(jestConfig.rootDir)) {
    return replacedRoot;
  }
  return path.join(jestConfig.importResolverProjectRoot, replacedRoot);
}
