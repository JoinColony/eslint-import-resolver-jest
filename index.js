const fs = require('fs');
const path = require('path');

const findRoot = require('find-root');
const mm = require('micromatch');

const JEST_ROOT_DIR_PREFIX = '<rootDir>/';

// Default values defined by Jest that are required by this resolution process
const JEST_DEFAULT_CONFIG = {
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
  moduleNameMapper: {},
  testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)(spec|test).js?(x)'],
  moduleDirectories: ['node_modules'],
};

exports.interfaceVersion = 2;

exports.resolve = function resolve(source, file, config) {
  let matches;
  const root = findRoot(file);
  const jestConfig = getJestConfig(file, config, root);
  let resolvedMatchers;
  const rootDir = getRootDir(jestConfig, root);

  if (jestConfig.testRegex) {
    matches = new RegExp(jestConfig.testRegex).test(file);
  } else {
    resolvedMatchers = resolveTestMatchers(jestConfig.testMatch, rootDir);
    matches = !!mm(file, resolvedMatchers).length;
  }
  if (!matches) {
    return { found: false };
  }

  const modulePath = getMappedModules(
    source,
    jestConfig.moduleDirectories,
    rootDir,
  );
  if (modulePath) {
    return {
      found: true,
      path: modulePath,
    };
  }

  const mappedPath = getMappedPath(
    source,
    jestConfig.moduleNameMapper,
    jestConfig.moduleFileExtensions,
    rootDir,
  );

  if (!mappedPath) {
    return { found: false };
  }

  return {
    found: true,
    path: mappedPath,
  };
};

/**
 * get the Jest configuration required for path resolution.
 * Will use jest configuration from package.json if no jestConfigFile is defined
 * Applies default configuration for any required properties that are undeclared
 * @param file Un-used
 * @param {Object} config
 * @param root directory where the package.json was located
 * @returns {Object}
 */
function getJestConfig(file, config = {}, root) {
  let jestConfig;
  if (config.jestConfigFile) {
    jestConfig = require(path.resolve(root, config.jestConfigFile));
  } else {
    const packageJson = require(path.resolve(root, 'package.json'));
    jestConfig = packageJson.jest;
  }
  if (!jestConfig.testMatch && !jestConfig.testRegex) {
    jestConfig.testMatch = JEST_DEFAULT_CONFIG.testMatch;
  }

  jestConfig = Object.assign({}, JEST_DEFAULT_CONFIG, jestConfig);

  return jestConfig;
}

/**
 * Resolve a source import to an absolute path
 * @param source Import path found within a Jest test file
 * @param moduleNameMapper A map from regular expressions to module names that allow to stub out resources
 * @param extensions File extensions to append to source path if no extension is defined
 * @param rootDir full working path
 * @returns {?String}
 */

function getMappedPath(source, moduleNameMapper, extensions, rootDir) {
  const moduleNameMappers = Object.keys(moduleNameMapper);
  for (let i = 0; i < moduleNameMappers.length; i += 1) {
    const regex = new RegExp(moduleNameMappers[i]);
    if (regex.test(source)) {
      const targetPath = moduleNameMapper[moduleNameMappers[i]];
      const modulePath = source
        .replace(regex, targetPath)
        .replace(JEST_ROOT_DIR_PREFIX, '');

      return resolvePath(modulePath, extensions, rootDir);
    }
  }
  return null;
}

/**
 * Resolve the working directory with the jest config root directory
 * @param {Object} config Jest configuration
 * @param {String} root working directory
 * @returns {String} Module resolution root directory
 */
function getRootDir(config, root) {
  if (config.rootDir) {
    return path.resolve(root, config.rootDir);
  }
  return root;
}

/**
 * Resolve a module path with a root directory. If no file extension is provided use a list of lookup extensions to append to the path.
 * Will also attempt to resolve to an index file
 * @param {String} modulePath
 * @param {String[]} extensions extensions to
 * @param {String} rootDir full working path
 * @returns {?String} Resolved rootDir/modulePath or rootDir/modulePath.ext or rootDir/modulePath/index.ext
 */
function resolvePath(modulePath, extensions, rootDir) {
  const mappedPath = path.resolve(rootDir, modulePath);

  if (path.extname(mappedPath)) {
    return mappedPath;
  }

  for (let i = 0; i < extensions.length; i += 1) {
    const ext = extensions[i];
    const pathWithExt = `${mappedPath}.${ext}`;

    if (fs.existsSync(pathWithExt)) {
      return pathWithExt;
    }

    const index = path.join(mappedPath, `index.${ext}`);
    if (fs.existsSync(index)) {
      return index;
    }
  }

  return null;
}

/**
 * Convert any testMatch entries that start with <rootDir>/ to the full root path
 * @param {String[]} testMatch entries
 * @param {String} rootDir full working path
 * @returns {Array}
 */
function resolveTestMatchers(testMatch, rootDir) {
  return testMatch.map(matcher => {
    if (matcher.startsWith(JEST_ROOT_DIR_PREFIX)) {
      return path.join(rootDir, matcher.replace(JEST_ROOT_DIR_PREFIX, ''));
    }
    return matcher;
  });
}

/**
 * Check if module exists in custom module directories
 * @param source Import path found within a Jest test file
 * @param {String[]} moduleDirectories custom module directories to look in for a certain module
 * @param {String} rootDir full working path
 * @returns {String?} Resolved module path
 */
function getMappedModules(source, moduleDirectories, rootDir) {
  for (let i = 0; i < moduleDirectories.length; i += 1) {
    const modulePath = path.resolve(rootDir, moduleDirectories[i], source);
    if (fs.existsSync(modulePath)) {
      return modulePath;
    }
  }
  return null;
}
