import type { SendBoxAttachment } from 'botframework-webchat-core';
import { useMemo } from 'react';

import { useSendBoxAttachmentsSlice } from './internal/domains/SendBoxSlices';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSendBoxAttachments(): readonly [
  readonly SendBoxAttachment[],
  // TODO: This should be Dispatch<SetStateAction<...>>, however Redux doesn't support this signature.
  //       When we move out of Redux, we should change it.
  (attachments: readonly SendBoxAttachment[]) => void
] {
  const sendBoxAttachments = useSendBoxAttachmentsSlice();
  const { setSendBoxAttachments } = useWebChatAPIContext();

  return useMemo(
    () => Object.freeze([sendBoxAttachments, setSendBoxAttachments]),
    [sendBoxAttachments, setSendBoxAttachments]
  );
}
