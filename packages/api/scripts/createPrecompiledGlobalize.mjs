import { cwd } from 'process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { relative, resolve } from 'path';
import Globalize from 'globalize';
import globalizeCompiler from 'globalize-compiler';
import Prettier from 'prettier';
import resolvePkg from 'resolve-pkg';

async function importJSON(moduleId, path) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return JSON.parse(await readFile(resolve(resolvePkg(moduleId), path), 'utf8'));
}

// There is an issue in the Unicode CLDR database (v36):
//
// - Polish has 4 different plural types: "one", "few", "many", "other"
// - However, some units, say "short/digital-kilobyte", only have "other" defined
// - When we localize 1024 (number) into kilobytes, it use the "one" type
// - Since "short/digital-kilobyte/one" is not defined in the database, `globalize` throw exception
//
// In all of our supported languages, we also observed the same issue in Portuguese as well.
//
// As a hotfix, we are patching the Unicode CLDR database for all `[long/short/narrow]/digital-*` rules to make sure it include all plurals needed for that language.
//
// For a long term fix, we should move forward to a newer version of CLDR database, which is outlined in https://github.com/rxaviers/cldr-data-npm/issues/78.

let FORBIDDEN_PROPERTY_NAMES;

function getForbiddenPropertyNames() {
  return (
    FORBIDDEN_PROPERTY_NAMES ||
    (FORBIDDEN_PROPERTY_NAMES = Object.freeze(
      Array.from(
        new Set([
          // As-of writing, `Object.prototype` includes:
          //   __defineGetter__
          //   __defineSetter__
          //   __lookupGetter__
          //   __lookupSetter
          //   __proto__
          //   constructor
          //   hasOwnProperty
          //   isPrototypeOf
          //   propertyIsEnumerable
          //   toLocaleString
          //   toString
          //   valueOf
          ...Object.getOwnPropertyNames(Object.prototype),

          'prototype'
        ])
      )
    ))
  );
}

function isForbiddenPropertyName(propertyName) {
  return getForbiddenPropertyNames().includes(propertyName);
}

async function loadPatchedUnits(language) {
  if (!/^[\w-]+$/u.test(language) && isForbiddenPropertyName(language)) {
    throw new Error(`Invalid language code "${language}".`);
  }

  const unitsJSON = await importJSON('cldr-units-full', `main/${language}/units.json`);

  const pluralsJSON = await importJSON('cldr-core', 'supplemental/plurals.json');

  // eslint-disable-next-line security/detect-object-injection
  const pluralsTypeCardinal = pluralsJSON.supplemental['plurals-type-cardinal'][language];

  if (!pluralsTypeCardinal) {
    return unitsJSON;
  }

  const plurals = ['other'];

  if (!(`pluralRule-count-other` in pluralsTypeCardinal)) {
    throw new Error(`Language ${language} does not have plural type "other".`);
  }

  ['zero', 'one', 'two', 'few', 'many'].forEach(pluralType => {
    `pluralRule-count-${pluralType}` in pluralsTypeCardinal && plurals.push(pluralType);
  });

  ['long', 'short', 'narrow'].forEach(form => {
    // Both "language" and "form" are filtered and free of forbidden values.
    // eslint-disable-next-line security/detect-object-injection
    Object.entries(unitsJSON.main[language].units[form]).forEach(([unitName, entry]) => {
      if (!unitName.startsWith('digital-')) {
        return;
      }

      if ('unitPattern-count-other' in entry) {
        const { 'unitPattern-count-other': other } = entry;

        plurals.forEach(pluralType => {
          const name = `unitPattern-count-${pluralType}`;

          if (!(name in entry)) {
            // "name" is free of forbidden values.
            // eslint-disable-next-line security/detect-object-injection
            entry[name] = other;
          }
        });
      }
    });
  });

  return unitsJSON;
}

(async function main() {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  Globalize.load(await importJSON('cldr-core', 'supplemental/likelySubtags.json'));
  Globalize.load(await importJSON('cldr-core', 'supplemental/numberingSystems.json'));
  Globalize.load(await importJSON('cldr-core', 'supplemental/plurals.json'));

  const overridesJSON = JSON.parse(
    // False-positive: import.meta.url is fixed and should be secure.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await readFile(new URL('../src/localization/overrides.json', import.meta.url), 'utf-8')
  );

  const languages = Object.values(overridesJSON).map(({ GLOBALIZE_LANGUAGE }) => GLOBALIZE_LANGUAGE);

  const databases = await Promise.all(
    languages.reduce(
      (promises, language) => [
        ...promises,
        importJSON('cldr-dates-full', `main/${language}/ca-gregorian.json`),
        importJSON('cldr-dates-full', `main/${language}/dateFields.json`),
        importJSON('cldr-numbers-full', `main/${language}/numbers.json`),
        // importJSON('cldr-units-full', `main/${language}/units.json`)
        loadPatchedUnits(language)
      ],
      []
    )
  );

  databases.forEach(database => Globalize.load(database));

  const formattersAndParsers = languages.reduce((formattersAndParsers, language) => {
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

  const code = await Prettier.format(globalizeCompiler.compile(formattersAndParsers), { parser: 'babel' });
  const outputFileURL = new URL('../lib/external/PrecompiledGlobalize.js', import.meta.url);

  // globalize-compiler is emitting AMD code, pointing to "globalize-runtime" instead of "globalize/dist/globalize-runtime"
  const patchedCode = code.replace(/"globalize-runtime\//gu, '"globalize/dist/globalize-runtime/');

  // False-positive: import.meta.url is fixed and should be secure.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!existsSync(new URL('.', outputFileURL))) {
    // False-positive: import.meta.url is fixed and should be secure.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await mkdir(new URL('.', outputFileURL), { recursive: true });
  }

  // False-positive: import.meta.url is fixed and should be secure.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await writeFile(outputFileURL, patchedCode);

  // eslint-disable-next-line no-console
  console.log(`Successfully compiled globalize to ${relative(cwd(), fileURLToPath(outputFileURL))}.`);
})();
