import { fileURLToPath } from 'url';
import { resolve } from 'path';
import fs from 'fs/promises';

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

function toDist(filename) {
  if (filename.includes('..')) {
    throw new Error('Filename cannot contains "..".');
  }

  return resolve(fileURLToPath(import.meta.url), '../../dist/', filename);
}

(async function () {
  // The function will make sure access to the path is limited.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const plurals = JSON.parse(await fs.readFile(toDist('supplemental/plurals.json'), 'utf8'));

  const languagePlurals = new Map();

  Object.entries(plurals.supplemental['plurals-type-cardinal']).forEach(([language, pluralsTypeCardinal]) => {
    const plurals = ['other'];

    languagePlurals.set(language, plurals);

    if (!(`pluralRule-count-other` in pluralsTypeCardinal)) {
      throw new Error(`Language ${language} does not have plural type "other".`);
    }

    ['zero', 'one', 'two', 'few', 'many'].forEach(pluralType => {
      `pluralRule-count-${pluralType}` in pluralsTypeCardinal && plurals.push(pluralType);
    });
  });

  const patchedLanguages = [];

  await Promise.all(
    Array.from(languagePlurals.entries()).map(async ([language, supportedPluralTypes]) => {
      if (!/^[\w-]+$/u.test(language) && isForbiddenPropertyName(language)) {
        throw new Error(`Invalid language code "${language}".`);
      }

      let units;

      try {
        // The function will make sure access to the path is limited.
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        units = JSON.parse(await fs.readFile(toDist(`main/${language}/units.json`), 'utf8'));
      } catch (err) {
        if (err.code === 'ENOENT') {
          return;
        }

        throw err;
      }

      let numFound = 0;

      ['long', 'short', 'narrow'].forEach(form => {
        // Both "language" and "form" are filtered and free of forbidden values.
        // eslint-disable-next-line security/detect-object-injection
        Object.entries(units.main[language].units[form]).forEach(([unitName, entry]) => {
          if (!unitName.startsWith('digital-')) {
            return;
          }

          if ('unitPattern-count-other' in entry) {
            const { 'unitPattern-count-other': other } = entry;

            supportedPluralTypes.forEach(pluralType => {
              const name = `unitPattern-count-${pluralType}`;

              if (!(name in entry)) {
                // "name" is free of forbidden values.
                // eslint-disable-next-line security/detect-object-injection
                entry[name] = other;
                numFound++;
              }
            });
          }
        });
      });

      if (numFound) {
        patchedLanguages.push(`${language} (${numFound} issues)`);

        // The function will make sure access to the path is limited.
        // eslint-disable-next-line security/detect-non-literal-fs-filename, no-magic-numbers
        await fs.writeFile(toDist(`main/${language}/units.json`), JSON.stringify(units, null, 2));
      }
    })
  );

  // We are display output in CLI.
  // eslint-disable-next-line no-console
  console.log(`Patched ${patchedLanguages.length} languages: ${patchedLanguages.join(', ')}.`);
})();
