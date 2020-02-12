import { useCallback } from 'react';

import useLocalizedStrings from './internal/useLocalizedStrings';

export default function useLocalizer() {
  const localizedStrings = useLocalizedStrings();

  return useCallback(
    (id, ...args) =>
      Object.entries(args).reduce(
        (str, [index, arg]) => str.replace(`$${+index + 1}`, arg),
        localizedStrings[id] || localizedStrings['en-US'][id] || ''
      ),
    [localizedStrings]
  );
}
