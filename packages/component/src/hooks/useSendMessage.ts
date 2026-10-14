import { type UseSendMessageInit, useSendMessage as useAPISendMessage } from 'botframework-webchat-api/hook.js';
import { useCallback } from 'react';

import useMakeThumbnail from './useMakeThumbnail';

export default function useSendMessage(): (
  text?: string | undefined,
  method?: string | undefined,
  init?: UseSendMessageInit | undefined
) => void {
  const makeThumbnail = useMakeThumbnail();
  const sendMessage = useAPISendMessage();

  return useCallback(
    async (text, method, init) => {
      const attachments = init?.attachments;

      sendMessage(text, method, {
        ...init,
        attachments: Object.freeze(
          await Promise.all(
            Array.from(attachments || []).map(async ({ blob, thumbnailURL }) => {
              if (!thumbnailURL && blob instanceof File) {
                thumbnailURL = await makeThumbnail(blob);
              }

              return Object.freeze({ blob, thumbnailURL });
            })
          )
        )
      });
    },
    [makeThumbnail, sendMessage]
  );
}
