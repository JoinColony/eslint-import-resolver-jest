## eslint-import-resolver-jest changelog

### [ [>](https://github.com/JoinColony/eslint-import-resolver-jest/tree/v2.1.2) ] 2.1.2 / 30.06.2019
* Fix test match global patterns on windows (thank you @KevinSjoberg!)

### [ [>](https://github.com/JoinColony/eslint-import-resolver-jest/tree/v2.1.1) ] 2.1.1 / 16.03.2018
* Start resolving from file path (by setting basedir in `resolve`)

### [ [>](https://github.com/JoinColony/eslint-import-resolver-jest/tree/v2.1.0) ] 2.1.0 / 14.03.2018
* Support absolute rootDir paths

### [ [>](https://github.com/JoinColony/eslint-import-resolver-jest/tree/v2.0.1) ] 2.0.1 / 19.02.2018
* Just some tooling rearrangements and typo fixes

### [ [>](https://github.com/JoinColony/eslint-import-resolver-jest/tree/v2.0.0) ] 2.0.0 / 18.02.2018
* Complete rewrite
* Using the [resolver](https://github.com/browserify/resolve) module now to do the heavy lifting
* Add flow type checking
* Fixed moduleDirectories support
* Add modulePaths support

### [ [>](https://github.com/JoinColony/eslint-import-resolver-jest/tree/v1.1.0) ] 1.1.0 / 02.11.2017
* A couple of new features / improvements (thanks [@GlennScott](https://github.com/GlenScott)!)
* Imports that do not have a file extension. Jest will attempt to resolve the import using a set of file extensions defined in moduleFileExtensions.
* Allow <rootDir> to be defined within the testMatch. The resolver needs to replace <rootDir> from the testMatch entries before attempting calling micromatch.
* Adding support to import an index file without an extension. The resolver will try source.ext1 -> source/index.ext1 -> source.ext2 -> source.index.ext2 etc
* In resolver.test.js mocking find-root to simplify mocking fs.existingSync (every test uses the name root value `""` so the mock always returns "")

### [ [>](https://github.com/JoinColony/eslint-import-resolver-jest/tree/v1.0.1) ] 1.0.1 / 24.08.2017
* Fix replacement patterns in moduleNameMapper (thanks [@samtgarson](https://github.com/samtgarson)!)

### [ [>](https://github.com/JoinColony/eslint-import-resolver-jest/tree/v1.0.0) ] 1.0.0 / 16.04.2017
* Initial release
