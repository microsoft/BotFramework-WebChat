import Observable from 'core-js/features/observable';

import DirectLineActivity from '../types/DirectLineActivity';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function usePostActivity(): (activity: DirectLineActivity) => Observable<string> {
  return useWebChatAPIContext().postActivity;
}
