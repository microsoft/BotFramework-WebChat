import { useCallback } from 'react';

import getAllStrings from '../Localization/getAllStrings';
import useLocalizedStrings from './internal/useLocalizedStrings';

export default function useLocalizer() {
  const localizedStrings = useLocalizedStrings();

  return useCallback(
    (id, ...args) =>
      Object.entries(args).reduce(
        (str, [index, arg]) => str.replace(`$${+index + 1}`, arg),
        localizedStrings[id] || getAllStrings()['en-US'][id] || ''
      ),
    [localizedStrings]
  );
}
