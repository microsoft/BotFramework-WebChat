import { useCallback } from 'react';

import getAllLocalizedStrings from '../Localization/getAllLocalizedStrings';
import useLocalizedStrings from './internal/useLocalizedStrings';

const DEFAULT_STRINGS = getAllLocalizedStrings()['en-US'];

export default function useLocalizer() {
  const localizedStrings = useLocalizedStrings();

  return useCallback(
    (id, ...args) =>
      Object.entries(args).reduce(
        (str, [index, arg]) => str.replace(`$${+index + 1}`, arg),
        localizedStrings[id] || DEFAULT_STRINGS[id] || ''
      ),
    [localizedStrings]
  );
}
