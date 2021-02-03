import { useEffect } from 'react';

import removeInline from '../../Utils/removeInline';
import useWebChatUIContext from './useWebChatUIContext';

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
