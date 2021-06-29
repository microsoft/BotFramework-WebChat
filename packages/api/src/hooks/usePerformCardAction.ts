import { DirectLineCardAction } from 'botframework-webchat-core';

import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function usePerformCardAction(): (cardAction: DirectLineCardAction) => void {
  return useWebChatAPIContext().onCardAction;
}
