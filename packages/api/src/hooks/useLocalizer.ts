import { isForbiddenPropertyName } from 'botframework-webchat-core';
import { useCallback } from 'react';

import { isPlainObject } from '@msinternal/botframework-webchat-base/utils';
import getAllLocalizedStrings from '../localization/getAllLocalizedStrings';
import useLocalizedGlobalize from './internal/useLocalizedGlobalize';
import useLocalizedStrings from './internal/useLocalizedStrings';

const DEFAULT_STRINGS = getAllLocalizedStrings()['en-US'];

type Plural = {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
};

type PluralLocalizer = (id: Plural, arg0: number, ...argRest: readonly string[]) => string;
type SingularLocalizer = (id: string, ...argRest: readonly string[]) => string;

function useLocalizer(init: { plural: true }): PluralLocalizer;
function useLocalizer(init?: { plural?: false } | undefined): SingularLocalizer;

function useLocalizer({ plural }: { plural?: boolean } = {}): PluralLocalizer | SingularLocalizer {
  const [globalize] = useLocalizedGlobalize();
  const localizedStrings = useLocalizedStrings();

  return useCallback(
    (id: string | Plural, arg0: number | string, ...argRest: readonly string[]) => {
      let stringId = id as string;

      if (plural) {
        const pluralId = id as Plural;

        if (!isPlainObject(pluralId)) {
          throw new Error('useLocalizer: Plural string must pass "id" as a plain object instead of string.');
        } else if (typeof pluralId.other !== 'string') {
          throw new Error('useLocalizer: Plural string must have "id.other" of string.');
        } else if (typeof arg0 !== 'number') {
          throw new Error('useLocalizer: Plural string must have first argument as a number.');
        }

        for (const pluralForm of ['zero', 'one', 'two', 'few', 'many']) {
          // Mitigation through allowlisting.
          // eslint-disable-next-line security/detect-object-injection
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

        stringId = pluralId[globalize.plural(arg0)] || pluralId.other;
      } else if (typeof id !== 'string') {
        throw new Error('useLocalizer: "id" must be a string.');
      }

      return Object.entries([arg0, ...argRest]).reduce(
        (str, [index, arg]) => str.replace(`$${+index + 1}`, arg),
        // Mitigation through denylisting.
        // eslint-disable-next-line security/detect-object-injection
        isForbiddenPropertyName(stringId) ? '' : localizedStrings[stringId] || DEFAULT_STRINGS[stringId] || ''
      );
    },
    [globalize, localizedStrings, plural]
  );
}

export default useLocalizer;
