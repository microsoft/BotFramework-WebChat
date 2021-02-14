import { useEffect } from 'react';

import removeInline from '../../Utils/removeInline';
import useWebChatUIContext from './useWebChatUIContext';

// This hook is for registering and unregister a callback, used by <BasicTranscript>.
// When called, the callback should scroll the transcript to a specific position, for example, to an activity of specified ID.

export default function useRegisterScrollTo(callback) {
  const { scrollToCallbacksRef } = useWebChatUIContext();

  useEffect(() => {
    if (callback) {
      const { current: scrollToCallbacks } = scrollToCallbacksRef;

      scrollToCallbacks.push(callback);

      return () => removeInline(scrollToCallbacks, callback);
    }
  }, [callback, scrollToCallbacksRef]);
}
