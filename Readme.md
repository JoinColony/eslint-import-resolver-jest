# eslint-import-resolver-jest

[![Greenkeeper badge](https://badges.greenkeeper.io/JoinColony/eslint-import-resolver-jest.svg)](https://greenkeeper.io/)

_"I like my `testutils` where I can see 'em"_ 🕵🏽‍♀️

[![CircleCI](https://circleci.com/gh/JoinColony/eslint-import-resolver-jest.svg?style=svg)](https://circleci.com/gh/JoinColony/eslint-import-resolver-jest)

If you're using [jest](https://facebook.github.io/jest/) and you have installed custom name mappings in your config via the `moduleNameMapper` config and you're using the wonderful [eslint-plugin-import](https://github.com/benmosher/eslint-plugin-import) you might get yelled at by eslint:

<img width="991" alt="grafik" src="https://cloud.githubusercontent.com/assets/2174084/25067977/a80c8d9e-2219-11e7-9189-4860d7f771d5.png">

(I oftentimes create an alias for the helpers I use for testing)

### Let's fix this!

```shell
yarn add eslint-import-resolver-jest -D
```

or

```shell
npm i eslint-import-resolver-jest -D
```

If you are using the [`package.json`](https://facebook.github.io/jest/docs/configuration.html) config option from jest everything should _just work_™.

If you are using a separate config file for jest using the `--config` option you have to point this plugin to it, too (in your .eslintrc):

```json
"settings": {
  "import/resolver": {
    "jest": {
      "jestConfigFile": "./jest.conf.json"
    }
  }
}
```

That's it!

#### Note

It will only resolve the modules in your test files that you specified via `testRegex` or `testMatch` in your jest config.

### Contributing

Create issues in this repo or get active yourself:

```shell
yarn test # npm test works, too
```

### License

MIT
