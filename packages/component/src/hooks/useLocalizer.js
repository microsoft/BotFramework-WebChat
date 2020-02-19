import { useCallback } from 'react';

import getAllLocalizedStrings from '../Localization/getAllLocalizedStrings';
import useLocalizedGlobalize from './internal/useLocalizedGlobalize';
import useLocalizedStrings from './internal/useLocalizedStrings';
import isObject from '../Utils/isObject';

const DEFAULT_STRINGS = getAllLocalizedStrings()['en-US'];

export default function useLocalizer({ plural } = {}) {
  const [globalize] = useLocalizedGlobalize();
  const localizedStrings = useLocalizedStrings();

  return useCallback(
    (id, ...args) => {
      if (plural) {
        if (!isObject(id)) {
          throw new Error('useLocalizer: Plural string must pass "id" as a map instead of string.');
        } else if (typeof id.other !== 'string') {
          throw new Error('useLocalizer: Plural string must have "id.other" of string.');
        } else if (typeof args[0] !== 'number') {
          throw new Error('useLocalizer: Plural string must have first argument as a number.');
        }

        for (const pluralForm of ['zero', 'one', 'two', 'few', 'many']) {
          const type = typeof id[pluralForm];

          if (type !== 'string' && type !== 'undefined') {
            throw new Error(`useLocalizer: Plural string must have "id.${pluralForm}" of string or undefined.`);
          }
        }

        const unsupportedPluralForms = Object.keys(id).filter(
          pluralForm => !['zero', 'one', 'two', 'few', 'many', 'other'].includes(pluralForm)
        );

        if (unsupportedPluralForms.length) {
          throw new Error(
            `useLocalizer: Plural string "id" must be either "zero", "one", "two", "few", "many", "other". But not ${unsupportedPluralForms
              .map(pluralForm => `"${pluralForm}"`)
              .join(', ')}.`
          );
        }

        id = id[globalize.plural(args[0])] || id.other;
      } else if (typeof id !== 'string') {
        throw new Error('useLocalizer: "id" must be a string.');
      }

      return Object.entries(args).reduce(
        (str, [index, arg]) => str.replace(`$${+index + 1}`, arg),
        localizedStrings[id] || DEFAULT_STRINGS[id] || ''
      );
    },
    [globalize, localizedStrings, plural]
  );
}
