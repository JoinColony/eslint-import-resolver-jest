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
  var jestConfig = getJestConfig(file, config, root);
  if (jestConfig.testRegex) {
    matches = new RegExp(jestConfig.testRegex).test(file);
  } else {
    matches = !!mm(file, jestConfig.testMatch).length;
  }
  if (!matches) { return { found: false }; }

  var path = getMappedPath(source, jestConfig, root);

  if (!path) { return { found: false }; }

  return {
    found: true,
    path: path
  };
};

function getJestConfig(file, config, root) {
  var jestConfig;
  config = config || {};
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
  var moduleNameMappers = Object.keys(config.moduleNameMapper || {});
  for (var i = 0; i < moduleNameMappers.length; i++) {
    var regex = new RegExp(moduleNameMappers[i]);
    if (regex.test(source)) {
      var targetPath = config.moduleNameMapper[moduleNameMappers[i]];
      var modulePath = source.replace(regex, targetPath).replace('<rootDir>/', '');

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
