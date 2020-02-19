const { format } = require('prettier');
const { join, relative } = require('path');
const { writeFileSync } = require('fs');
const Globalize = require('globalize');
const globalizeCompiler = require('globalize-compiler');
const languages = Object.values(require('../src/Localization/overrides.json')).map(
  ({ GLOBALIZE_LANGUAGE }) => GLOBALIZE_LANGUAGE
);

Globalize.load(require('cldr-data').entireSupplemental());

const formattersAndParsers = languages.reduce((formattersAndParsers, language) => {
  Globalize.load(require('cldr-data').entireMainFor(language));

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
const filename = join(__dirname, '../lib/Utils/PrecompiledGlobalize.js');

// globalize-compiler is emitting AMD code, pointing to "globalize-runtime" instead of "globalize/dist/globalize-runtime"
const patchedCode = code.replace(/\"globalize-runtime\//g, '"globalize/dist/globalize-runtime/');

writeFileSync(filename, patchedCode);

console.log(`Successfully compiled globalize to ${relative(process.cwd(), filename)}.`);
