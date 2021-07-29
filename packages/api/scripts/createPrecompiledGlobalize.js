const { format } = require('prettier');
const { dirname, join, relative } = require('path');
const { existsSync, mkdirSync, writeFileSync } = require('fs');
const Globalize = require('globalize');
const globalizeCompiler = require('globalize-compiler');
const languages = Object.values(require('../src/localization/overrides.json')).map(
  ({ GLOBALIZE_LANGUAGE }) => GLOBALIZE_LANGUAGE
);
const cldrData = require('../../support/cldr-data');

Globalize.load(cldrData.entireSupplemental());

const formattersAndParsers = languages.reduce((formattersAndParsers, language) => {
  Globalize.load(cldrData.entireMainFor(language));

  const globalize = new Globalize(language);

  return [
    ...formattersAndParsers,
    ...[
      globalize.dateFormatter({ skeleton: 'MMMMdhm' }),
      globalize.pluralGenerator(),
      globalize.relativeTimeFormatter('hour'),
      globalize.relativeTimeFormatter('minute'),
      globalize.unitFormatter('byte', { form: 'long' }),
      globalize.unitFormatter('kilobyte', { form: 'short' }),
      globalize.unitFormatter('megabyte', { form: 'short' }),
      globalize.unitFormatter('gigabyte', { form: 'short' })
    ]
  ];
}, []);

const code = format(globalizeCompiler.compile(formattersAndParsers), { parser: 'babel' });
const filename = join(__dirname, '../lib/external/PrecompiledGlobalize.js');

// globalize-compiler is emitting AMD code, pointing to "globalize-runtime" instead of "globalize/dist/globalize-runtime"
const patchedCode = code.replace(/\"globalize-runtime\//g, '"globalize/dist/globalize-runtime/');

existsSync(dirname(filename)) || mkdirSync(dirname(filename), { recursive: true });
writeFileSync(filename, patchedCode);

console.log(`Successfully compiled globalize to ${relative(process.cwd(), filename)}.`);
