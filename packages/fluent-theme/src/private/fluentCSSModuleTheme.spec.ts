/// <reference types="jest" />

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import { readdirSync, readFileSync } from 'fs';
import { transform } from 'lightningcss';
import { join, relative } from 'path';

const PACKAGES_PATH = join(__dirname, '../../..');

const listCSSModules = (packageName: string): readonly string[] =>
  // Paths are constants of this test, not user input.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  readdirSync(join(PACKAGES_PATH, packageName, 'src'), { recursive: true, encoding: 'utf8' })
    .filter(path => path.endsWith('.module.css') && !path.includes('__tests__'))
    .map(path => join(PACKAGES_PATH, packageName, 'src', path));

// Local names as the build exports them (Lightning CSS with the CSS modules options of esbuildPlugins.mjs).
const getLocalNames = (path: string): readonly string[] =>
  Object.keys(
    transform({
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      code: readFileSync(path),
      cssModules: { animation: false, customIdents: false, grid: false, pattern: 'w[hash]_[local]' },
      filename: path
    }).exports ?? {}
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

// The CSS module with every Fluent rule for Web Chat elements, which FluentThemeProvider passes whole.
const OVERRIDE_MODULE_PATH = join(__dirname, 'fluentCSSModuleTheme.module.css');

const isOverrideModule = (path: string): boolean => path === OVERRIDE_MODULE_PATH;

const fluentCSSModuleLocalNames: readonly ReadonlySet<string>[] = listCSSModules('fluent-theme')
  .filter(path => !isOverrideModule(path))
  .map(path => new Set(getLocalNames(path)));

const fluentLocalNames = new Set(fluentCSSModuleLocalNames.flatMap(localNames => [...localNames]));

// Fluent's own local names of each compound selector (e.g. ".theme.variant-copilot:hover"), with nesting resolved.
function getFluentCompounds(path: string): readonly (readonly string[])[] {
  let css = transform({
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    code: readFileSync(path),
    // Marks local names, so readable class names from :global() are left out.
    cssModules: { animation: false, customIdents: false, grid: false, pattern: 'local--[local]' },
    filename: path,
    // Old enough to resolve nesting.
    targets: { chrome: 90 << 16 }
  }).code.toString();

  // Drops arguments of :has(), :not() and others, whose compounds are not on the same element.
  for (let previous; previous !== css; ) {
    previous = css;
    css = css.replace(/\([^()]*\)/gu, '');
  }

  return Object.freeze(
    // Compounds are runs of class names and pseudo-classes, so anything else separates them.
    css
      .split(/[^-\w.:]/u)
      .map(compound =>
        Array.from(compound.matchAll(/\.local--([-\w]+)/gu)).flatMap(([, localName]) =>
          localName && !webChatLocalNames.has(localName) ? [localName] : []
        )
      )
      .filter(compound => compound.length)
  );
}

// FluentIcon's own classes, which happen to share a name with a Web Chat class.
const FLUENT_ICON_LOCAL_NAMES: ReadonlySet<string> = Object.freeze(
  new Set(['appearance--text', 'icon--attachment', 'icon--microphone', 'icon--send'])
);

scenario(
  'Fluent CSS module theme',
  bdd => {
    bdd
      .given('every Fluent CSS module', () => listCSSModules('fluent-theme'))
      .when('reading its local names and the class names it selects through :global()', paths =>
        paths.map(path => ({
          path: relative(PACKAGES_PATH, path),
          webChatGlobalClassNames: getGlobalClassNames(path).filter(className => webChatLocalNames.has(className)),
          // A Web Chat local name in a Fluent rule only matches from the override module, which is passed whole.
          webChatLocalNamesOutsideOverrides: isOverrideModule(path)
            ? []
            : getLocalNames(path).filter(
                localName => webChatLocalNames.has(localName) && !FLUENT_ICON_LOCAL_NAMES.has(localName)
              )
        }))
      )
      .then('none should select a local name of a Web Chat CSS module through :global()', (_, results) =>
        expect(results.filter(({ webChatGlobalClassNames }) => webChatGlobalClassNames.length)).toEqual([])
      )
      .and('only the override module should use local names of Web Chat CSS modules', (_, results) =>
        expect(
          results.filter(({ webChatLocalNamesOutsideOverrides }) => webChatLocalNamesOutsideOverrides.length)
        ).toEqual([])
      );

    bdd
      .given('the Fluent override module', () => OVERRIDE_MODULE_PATH)
      .when('reading its local names', path => ({
        // Besides Web Chat local names, only Fluent's own local names that scope the rules, e.g. ".theme".
        // The composer adds their class names to Fluent's elements as well.
        localNamesNotFromWebChatNorFluent: getLocalNames(path).filter(
          localName => !webChatLocalNames.has(localName) && !fluentLocalNames.has(localName)
        ),
        // A Fluent element only gets the override module's class names for the local names of its own CSS module,
        // e.g. ".theme.variant-copilot" needs a Fluent CSS module that declares both "theme" and "variant-copilot".
        undeclaredFluentCompounds: getFluentCompounds(path).filter(
          compound =>
            !fluentCSSModuleLocalNames.some(localNames => compound.every(localName => localNames.has(localName)))
        )
      }))
      .then(
        'should only use local names of Web Chat and of Fluent CSS modules',
        (_, { localNamesNotFromWebChatNorFluent }) => expect(localNamesNotFromWebChatNorFluent).toEqual([])
      )
      .and(
        "should only combine Fluent's local names that one Fluent CSS module declares",
        (_, { undeclaredFluentCompounds }) => expect(undeclaredFluentCompounds).toEqual([])
      );
  },
  JestGlobals
);
