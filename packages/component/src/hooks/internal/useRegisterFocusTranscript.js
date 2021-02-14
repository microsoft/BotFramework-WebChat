import { useEffect } from 'react';

import removeInline from '../../Utils/removeInline';
import useWebChatUIContext from './useWebChatUIContext';

// This hook is for registering and unregister a callback, used by <BasicTranscript>.
// When called, the callback should focus on the transcript.

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
