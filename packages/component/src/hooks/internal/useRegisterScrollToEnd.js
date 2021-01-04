import { useEffect } from 'react';

import removeInline from '../../Utils/removeInline';
import useWebChatUIContext from './useWebChatUIContext';

export default function useRegisterScrollTo(callback) {
  const { scrollToEndCallbacksRef } = useWebChatUIContext();

  useEffect(() => {
    const { current: scrollToEndCallbacks } = scrollToEndCallbacksRef;

    scrollToEndCallbacks.push(callback);

    return () => removeInline(scrollToEndCallbacks, callback);
  }, [scrollToEndCallbacksRef]);
}
