import { useContext } from 'react';

import { useSelector } from '../WebChatReduxContext';
import WebChatUIContext from '../WebChatUIContext';

export default function useSuggestedActions() {
  const value = useSelector(({ suggestedActions }) => suggestedActions);
  const { clearSuggestedActions } = useContext(WebChatUIContext);

  return [
    value,
    value => {
      if (value && value.length) {
        throw new Error('SuggestedActions cannot be set to values other than empty.');
      }

      clearSuggestedActions();
    }
  ];
}
