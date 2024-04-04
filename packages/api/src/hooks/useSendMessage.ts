import { useCallback } from 'react';

import type { WebChatPostActivityAttachment } from 'botframework-webchat-core';
import useWebChatAPIContext from './internal/useWebChatAPIContext';
import useTrackEvent from './useTrackEvent';

type SendMessage = (
  text?: string,
  method?: string,
  init?: { attachments?: readonly WebChatPostActivityAttachment[] | undefined; channelData?: any }
) => void;

export default function useSendMessage(): SendMessage {
  const { sendMessage } = useWebChatAPIContext();
  const trackEvent = useTrackEvent();

  return useCallback<SendMessage>(
    (text, method, { attachments, channelData } = {}) => {
      trackEvent('sendMessage', {
        numAttachments: attachments?.length || 0,
        // eslint-disable-next-line no-magic-numbers
        sumSizeInKB: Math.round(attachments?.reduce((total, { size }) => total + size, 0) / 1024)
      });

      sendMessage(text, method, { attachments, channelData });
    },
    [sendMessage, trackEvent]
  );
}
