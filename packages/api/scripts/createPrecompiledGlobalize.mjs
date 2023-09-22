import { cwd } from 'process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { relative } from 'path';
import cldrData from 'cldr-data';
import Globalize from 'globalize';
import globalizeCompiler from 'globalize-compiler';
import Prettier from 'prettier';

(async function () {
  const overridesJSON = JSON.parse(
    // False-positive: import.meta.url is fixed and should be secure.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await readFile(new URL('../src/localization/overrides.json', import.meta.url), 'utf-8')
  );

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
