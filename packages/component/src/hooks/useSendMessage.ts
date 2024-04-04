import { hooks } from 'botframework-webchat-api';
import { useCallback } from 'react';

import useConvertFileToAttachment from './internal/useConvertFileToAttachment';

const { useSendMessage: useAPISendMessage } = hooks;

type SendMessage = (
  text?: string,
  method?: string,
  init?: { channelData?: any; files?: Iterable<File> | undefined }
) => void;

export default function useSendMessage(): SendMessage {
  const convertFileToAttachment = useConvertFileToAttachment();
  const sendMessage = useAPISendMessage();

  return useCallback<SendMessage>(
    async (text, method, { channelData, files } = {}) => {
      sendMessage(text, method, {
        attachments: files ? await Promise.all([...files].map(convertFileToAttachment)) : [],
        channelData
      });
    },
    [convertFileToAttachment, sendMessage]
  );
}
