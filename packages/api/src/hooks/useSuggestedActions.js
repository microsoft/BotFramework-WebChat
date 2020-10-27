import { useCallback } from 'react';

import { useSelector } from './internal/WebChatReduxContext';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSuggestedActions() {
  const value = useSelector(({ suggestedActions }) => suggestedActions);
  const { clearSuggestedActions } = useWebChatAPIContext();

  return [
    value,
    useCallback(
      value => {
        if (value && value.length) {
          throw new Error('SuggestedActions cannot be set to values other than empty.');
        }

        clearSuggestedActions();
      },
      [clearSuggestedActions]
    )
  ];
}
