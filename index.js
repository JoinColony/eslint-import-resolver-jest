var path = require('path');

var findRoot = require('find-root');
var mm = require('micromatch');

exports.interfaceVersion = 2;

var jestDefaultConfig = {
  testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)(spec|test).js?(x)']
};

exports.resolve = function (source, file, config) {
  var matches;
  var root = findRoot(file);
  var config = getJestConfig(file, config, root);
  if (config.testRegex) {
    matches = new RegExp(config.testRegex).test(file);
  } else {
    matches = !!mm(file, config.testMatch).length;
  }
  if (!matches) { return { found: false } }

  var path = getMappedPath(source, config, root);

  if (!path) { return { found: false } };

  return {
    found: true,
    path: path
  };
}

function getJestConfig(file, config, root) {
  var jestConfig;
  if (config.jestConfigFile) {
    jestConfig = require(path.resolve(root, config.jestConfigFile));
  } else {
    var packageJson = require(path.resolve(root, 'package.json'));
    jestConfig = packageJson.jest;
  }
  if (!jestConfig.testMatch && !jestConfig.testRegex) {
    jestConfig.testMatch = jestDefaultConfig.testMatch;
  }
  return jestConfig;
}

function getMappedPath(source, config, root) {
  var moduleNameMappers = Object.keys(config.moduleNameMapper);
  for (var i = 0; i < moduleNameMappers.length; i++) {
    if (new RegExp(moduleNameMappers[i]).test(source)) {
      var modulePath = config.moduleNameMapper[moduleNameMappers[i]].replace('<rootDir>/', '');
      var rootDir;
      if (config.rootDir) {
        rootDir = path.resolve(root, config.rootDir);
      } else {
        rootDir = root;
      }
      return path.resolve(rootDir, modulePath);
    }
  }
}
