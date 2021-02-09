import { useEffect } from 'react';

import removeInline from '../../Utils/removeInline';
import useWebChatUIContext from './useWebChatUIContext';

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
