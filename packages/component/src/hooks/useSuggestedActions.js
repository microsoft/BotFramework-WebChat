import { useCallback } from 'react';

import { useSelector } from '../WebChatReduxContext';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useSuggestedActions() {
  const value = useSelector(({ suggestedActions }) => suggestedActions);
  const { clearSuggestedActions } = useWebChatUIContext();

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
