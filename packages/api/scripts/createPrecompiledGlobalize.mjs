import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { relative } from 'path';
import cldrData from 'cldr-data';
import Globalize from 'globalize';
import globalizeCompiler from 'globalize-compiler';
import Prettier from 'prettier';

const overridesJSON = JSON.parse(readFileSync(new URL('../src/localization/overrides.json', import.meta.url), 'utf-8'));

const languages = Object.values(overridesJSON).map(({ GLOBALIZE_LANGUAGE }) => GLOBALIZE_LANGUAGE);

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

const code = Prettier.format(globalizeCompiler.compile(formattersAndParsers), { parser: 'babel' });
const outputFileURL = new URL('../lib/external/PrecompiledGlobalize.js', import.meta.url);

// globalize-compiler is emitting AMD code, pointing to "globalize-runtime" instead of "globalize/dist/globalize-runtime"
const patchedCode = code.replace(/\"globalize-runtime\//g, '"globalize/dist/globalize-runtime/');

existsSync(new URL('.', outputFileURL)) || mkdirSync(new URL('.', outputFileURL), { recursive: true });
writeFileSync(outputFileURL, patchedCode);

console.log(`Successfully compiled globalize to ${relative(process.cwd(), fileURLToPath(outputFileURL))}.`);
