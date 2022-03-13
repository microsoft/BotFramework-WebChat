import Observable from 'core-js/features/observable';
import type { DirectLineActivity } from 'botframework-webchat-core';

import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function usePostActivity(): (activity: DirectLineActivity) => Observable<string> {
  return useWebChatAPIContext().postActivity;
}
