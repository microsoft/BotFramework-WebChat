import { useEffect } from 'react';

import removeInline from '../../Utils/removeInline';
import useWebChatUIContext from './useWebChatUIContext';

// This hook is for registering and unregister a callback, used by <BasicSendBox>.
// When called, the callback should focus on the text box of the send box.

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
