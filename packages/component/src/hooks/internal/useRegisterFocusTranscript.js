import { useEffect } from 'react';

import removeInline from '../../Utils/removeInline';
import useWebChatUIContext from './useWebChatUIContext';

export default function useRegisterFocusTranscript(callback) {
  const { focusTranscriptCallbacksRef } = useWebChatUIContext();

  useEffect(() => {
    if (callback) {
      const { current: focusTranscriptCallbacks } = focusTranscriptCallbacksRef;

      focusTranscriptCallbacks.push(callback);

      return () => removeInline(focusTranscriptCallbacks, callback);
    }
  }, [callback, focusTranscriptCallbacksRef]);
}
