import { useCallback } from 'react';

import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useLocalizeCallback() {
  const { localizedStrings } = useWebChatUIContext();

  return useCallback(
    (id, ...args) =>
      Object.entries(args).reduce(
        (str, [index, arg]) => str.replace(`$${+index + 1}`, arg),
        localizedStrings[id] || localizedStrings['en-US'][id] || ''
      ),
    [localizedStrings]
  );
}
