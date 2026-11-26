// Run with `node --test lightningCSSOptions.spec.mjs` (Jest cannot load this module: it uses `import.meta`).
import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { sortClassMap } from './lightningCSSOptions.mjs';

const facility = { afterEach, beforeEach, describe, it };

// As unplugin-lightningcss 0.4.5 writes it, with the classes in the random order of Lightning CSS.
const toClassMap = names =>
  [
    `import "/src/Card.module_built.css";\nconst classes = ${JSON.stringify(Object.fromEntries(names.map(name => [name, `wAbC123_${name}`])))}\nexport default classes\n`,
    ...names.map(
      name =>
        `\nconst _${name.replaceAll(/\W/gu, '_')}0 = classes[${JSON.stringify(name)}]\nexport { _${name.replaceAll(/\W/gu, '_')}0 as ${JSON.stringify(name)} }\n`
    )
  ].join('');

scenario(
  'sorting the class map of a CSS module',
  bdd => {
    bdd
      .given('the class map of 3 classes in random order', () => toClassMap(['card__title', 'card', 'card--active']))
      .when('sorted', classMap => sortClassMap(classMap, '/src/Card.module.css?css_module'))
      .then('should be the class map in the order of the class names', (_, sorted) =>
        expect(sorted).toBe(toClassMap(['card', 'card--active', 'card__title']))
      );

    bdd
      .given('the same classes in two random orders', () => [
        toClassMap(['card--active', 'card__title', 'card']),
        toClassMap(['card__title', 'card', 'card--active'])
      ])
      .when('sorted', classMaps => classMaps.map(classMap => sortClassMap(classMap, '/src/Card.module.css?css_module')))
      .then('should be the same code', (_, [first, second]) => expect(first).toBe(second));

    bdd
      .given('the class map of a CSS module without classes', () => toClassMap([]))
      .when('sorted', classMap => sortClassMap(classMap, '/src/Empty.module.css?css_module'))
      .then('should be unchanged', (classMap, sorted) => expect(sorted).toBe(classMap));

    bdd
      .given('code in another format', () => 'export default { card: "wAbC123_card" };\n')
      .when('sorted', code => () => sortClassMap(code, '/src/Card.module.css?css_module'))
      .then('should throw', (_, sort) =>
        expect(sort).toThrow('Unknown class map format from unplugin-lightningcss in /src/Card.module.css?css_module.')
      );
  },
  facility
);
