import type { SendBoxAttachment } from 'botframework-webchat-core';
import { useCallback } from 'react';

import useWebChatAPIContext from './internal/useWebChatAPIContext';
import useTrackEvent from './useTrackEvent';

type UseSendMessageInit = {
  readonly attachments?: readonly SendBoxAttachment[] | undefined;
  readonly channelData?: any;
  readonly replyToId?: string | undefined;
};

function useSendMessage(): (
  text?: string | undefined,
  method?: string | undefined,
  init?: UseSendMessageInit | undefined
) => void {
  const { sendMessage } = useWebChatAPIContext();
  const trackEvent = useTrackEvent();

  return useCallback(
    (text, method, { attachments, channelData, replyToId } = {}) => {
      const attachmentsArray = Object.freeze(Array.from(attachments || []));

      trackEvent('sendMessage', {
        numAttachments: attachmentsArray.length || 0,
        sumSizeInKB: Math.round(
          attachmentsArray.reduce((total, { blob: { size } }) => total + size, 0) /
            // eslint-disable-next-line no-magic-numbers
            1024
        )
      });

      sendMessage(text, method, { attachments: attachmentsArray, channelData, replyToId });
    },
    [sendMessage, trackEvent]
  );
}

export default useSendMessage;
export { type UseSendMessageInit };
