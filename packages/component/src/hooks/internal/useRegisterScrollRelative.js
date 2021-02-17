import { useEffect } from 'react';

import removeInline from '../../Utils/removeInline';
import useWebChatUIContext from './useWebChatUIContext';

// This hook is for registering and unregister a callback, used by <BasicTranscript>.
// When called, the callback should scroll the transcript in a relative motion, for example, page up and down.

export default function useRegisterScrollRelative(callback) {
  const { scrollRelativeCallbacksRef } = useWebChatUIContext();

  useEffect(() => {
    if (callback) {
      const { current: scrollRelativeCallbacks } = scrollRelativeCallbacksRef;

      scrollRelativeCallbacks.push(callback);

      return () => removeInline(scrollRelativeCallbacks, callback);
    }
  }, [callback, scrollRelativeCallbacksRef]);
}
