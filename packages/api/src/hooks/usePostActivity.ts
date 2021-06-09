import { DirectLineActivity } from 'botframework-webchat-core';
import Observable from 'core-js/features/observable';

import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function usePostActivity(): (activity: DirectLineActivity) => Observable<string> {
  return useWebChatAPIContext().postActivity;
}
