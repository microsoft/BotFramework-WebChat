import type { WebChatPostActivityAttachment } from 'botframework-webchat-core';
import { useMemo, type Dispatch, type SetStateAction } from 'react';

import { useSelector } from './internal/WebChatReduxContext';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSendBoxAttachments(): readonly [
  readonly WebChatPostActivityAttachment[],
  Dispatch<SetStateAction<readonly WebChatPostActivityAttachment[]>>
] {
  // TODO: We should use the selector from "core" package.
  const sendBoxAttachments = useSelector(({ sendBoxAttachments }) => sendBoxAttachments);
  const { setSendBoxAttachments } = useWebChatAPIContext();

  return useMemo(
    () => Object.freeze([sendBoxAttachments, setSendBoxAttachments]),
    [sendBoxAttachments, setSendBoxAttachments]
  );
}
