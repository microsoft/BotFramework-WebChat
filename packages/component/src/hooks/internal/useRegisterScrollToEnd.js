import { useEffect } from 'react';

import removeInline from '../../Utils/removeInline';
import useWebChatUIContext from './useWebChatUIContext';

// This hook is for registering and unregister a callback, used by <BasicTranscript>.
// When called, the callback should scroll the transcript to the end.

export default function useRegisterScrollTo(callback) {
  const { scrollToEndCallbacksRef } = useWebChatUIContext();

  useEffect(() => {
    const { current: scrollToEndCallbacks } = scrollToEndCallbacksRef;

    scrollToEndCallbacks.push(callback);

    return () => removeInline(scrollToEndCallbacks, callback);
  }, [callback, scrollToEndCallbacksRef]);
}
