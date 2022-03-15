import Observable from 'core-js/features/observable';
import type { WebChatActivity } from 'botframework-webchat-core';

import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function usePostActivity(): (activity: WebChatActivity) => Observable<string> {
  return useWebChatAPIContext().postActivity;
}
