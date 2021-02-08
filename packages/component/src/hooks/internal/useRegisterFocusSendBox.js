import { useEffect } from 'react';

import removeInline from '../../Utils/removeInline';
import useWebChatUIContext from './useWebChatUIContext';

export default function useRegisterFocusSendBox(callback) {
  const { focusSendBoxCallbacksRef } = useWebChatUIContext();

  useEffect(() => {
    if (callback) {
      const { current: focusSendBoxCallbacks } = focusSendBoxCallbacksRef;

      focusSendBoxCallbacks.push(callback);

      return () => removeInline(focusSendBoxCallbacks, callback);
    }
  }, [callback, focusSendBoxCallbacksRef]);
}
