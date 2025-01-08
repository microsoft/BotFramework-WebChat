import { type DirectLineCardAction, type WebChatActivity } from 'botframework-webchat-core';
import { useCallback } from 'react';

import { useSelector } from './internal/WebChatReduxContext';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSuggestedActions(): [
  DirectLineCardAction[],
  (suggestedActions: never[]) => void,
  extras: { activity: WebChatActivity }
] {
  const [value, activity] = useSelector(
    ({
      suggestedActions,
      suggestedActionsOriginActivity: { activity }
    }: {
      suggestedActions: readonly DirectLineCardAction[];
      suggestedActionsOriginActivity: { activity: undefined | WebChatActivity };
    }) => [suggestedActions, activity]
  );
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
    ),
    { activity }
  ];
}
