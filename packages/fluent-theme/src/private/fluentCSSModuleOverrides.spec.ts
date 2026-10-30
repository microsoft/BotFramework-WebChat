/// <reference types="jest" />

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import { readdirSync, readFileSync } from 'fs';
import { transform } from 'lightningcss';
import { join, relative } from 'path';

import { partGroupingDecoratorOverrides, sendBoxOverrides, themeOverrides } from './fluentCSSModuleOverrides';

const PACKAGES_PATH = join(__dirname, '../../..');

const listCSSModules = (packageName: string): readonly string[] =>
  // Paths are constants of this test, not user input.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  readdirSync(join(PACKAGES_PATH, packageName, 'src'), { recursive: true, encoding: 'utf8' })
    .filter(path => path.endsWith('.module.css') && !path.includes('__tests__'))
    .map(path => join(PACKAGES_PATH, packageName, 'src', path));

// Local names as Lightning CSS (the CSS module compiler of the build) exports them.
const getLocalNames = (path: string): readonly string[] =>
  Object.keys(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    transform({ code: readFileSync(path), cssModules: true, filename: path }).exports ?? {}
  );

// Class names selected through `:global(…)`, which only match readable class names.
function getGlobalClassNames(path: string): readonly string[] {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const css = readFileSync(path, 'utf8');
  const classNames: string[] = [];

  for (let index = css.indexOf(':global('); ~index; index = css.indexOf(':global(', index + 1)) {
    let depth = 0;
    let end = index + ':global'.length;

    for (; end < css.length; end++) {
      if (css[+end] === '(') {
        depth++;
      } else if (css[+end] === ')' && !--depth) {
        break;
      }
    }

    // The whole match is ".<class name>".
    classNames.push(...Array.from(css.slice(index, end).matchAll(/\.-?[_a-z][-\w]*/giu), ([match]) => match.slice(1)));
  }

  return Object.freeze(classNames);
}

const webChatLocalNames = new Set([...listCSSModules('component'), ...listCSSModules('bundle')].flatMap(getLocalNames));

const OVERRIDES_BY_FLUENT_CSS_MODULE: Readonly<Record<string, readonly string[]>> = Object.freeze({
  'fluent-theme/src/components/activity/PartGroupingDecorator.module.css': partGroupingDecoratorOverrides,
  'fluent-theme/src/components/sendBox/SendBox.module.css': sendBoxOverrides,
  'fluent-theme/src/components/theme/Theme.module.css': themeOverrides
});

scenario(
  'Fluent overrides of Web Chat CSS modules',
  bdd => {
    bdd
      .given('the local names that FluentThemeProvider passes through the CSS module theme', () =>
        Object.entries(OVERRIDES_BY_FLUENT_CSS_MODULE).map(([path, localNames]) => ({
          localNames,
          path: join(PACKAGES_PATH, path)
        }))
      )
      .when('reading the Fluent CSS modules', overrides =>
        overrides.map(({ localNames, path }) => ({
          fluentLocalNames: getLocalNames(path),
          globalClassNames: getGlobalClassNames(path),
          localNames,
          path
        }))
      )
      .then('every local name should be defined by the Fluent CSS module', (_, results) =>
        results.forEach(({ fluentLocalNames, localNames }) =>
          expect(fluentLocalNames).toEqual(expect.arrayContaining([...localNames]))
        )
      )
      .and('every local name should be defined by a Web Chat CSS module', (_, results) =>
        results.forEach(({ localNames }) =>
          expect(localNames.filter(localName => !webChatLocalNames.has(localName))).toEqual([])
        )
      )
      .and('no local name should still be selected through :global()', (_, results) =>
        results.forEach(({ globalClassNames, localNames }) =>
          expect(localNames.filter(localName => globalClassNames.includes(localName))).toEqual([])
        )
      )
      .and('the lists should be sorted', (_, results) =>
        results.forEach(({ localNames }) => expect(localNames).toEqual([...localNames].sort()))
      );

    bdd
      .given('every Fluent CSS module', () => listCSSModules('fluent-theme'))
      .when('reading the class names it selects through :global()', paths =>
        paths.map(path => ({
          path: relative(PACKAGES_PATH, path),
          webChatGlobalClassNames: getGlobalClassNames(path).filter(className => webChatLocalNames.has(className))
        }))
      )
      .then('none should be a local name of a Web Chat CSS module', (_, results) =>
        expect(results.filter(({ webChatGlobalClassNames }) => webChatGlobalClassNames.length)).toEqual([])
      );
  },
  JestGlobals
);
