import cldrData from '@msinternal/botframework-webchat-cldr-data';
import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import Globalize from 'globalize';
import globalizeCompiler from 'globalize-compiler';
import { relative } from 'path';
import Prettier from 'prettier';
import { cwd } from 'process';
import { fileURLToPath } from 'url';

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

  const code = await Prettier.format(
    globalizeCompiler.compile(formattersAndParsers, {
      template: ({ code, dependencies }) =>
        `
/* eslint-disable */
import Globalize from 'globalize/dist/globalize-runtime';

${dependencies.map(name => `import 'globalize/dist/${name}';`).join('\n')}

${code}

export default Globalize;
`
    }),
    { parser: 'babel' }
  );
  const outputFileURL = new URL('../src/external/PrecompiledGlobalize.js', import.meta.url);

  // False-positive: import.meta.url is fixed and should be secure.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!existsSync(new URL('.', outputFileURL))) {
    // False-positive: import.meta.url is fixed and should be secure.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await mkdir(new URL('.', outputFileURL), { recursive: true });
  }

  // False-positive: import.meta.url is fixed and should be secure.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await writeFile(outputFileURL, code);

  // eslint-disable-next-line no-console
  console.log(`Successfully compiled globalize to ${relative(cwd(), fileURLToPath(outputFileURL))}.`);
})();
