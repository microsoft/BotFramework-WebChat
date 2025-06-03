import { useCallback } from 'react';
import { useRefFrom } from 'use-ref-from';

import { useSendBoxAttachmentsHooks } from './index';
import useWebChatAPIContext from './internal/useWebChatAPIContext';
import useTrackEvent from './useTrackEvent';

export default function useSubmitSendBox(): (method?: string, { channelData }?: { channelData: any }) => void {
  // TODO: Move the logic into APIContext.submitSendBox.
  // eslint-disable-next-line local-rules/forbid-use-hook-producer
  const [sendBoxAttachments] = useSendBoxAttachmentsHooks().useSendBoxAttachments();
  const { submitSendBox } = useWebChatAPIContext();
  const trackEvent = useTrackEvent();

  const sendBoxAttachmentsRef = useRefFrom(sendBoxAttachments);

  return useCallback(
    (method: string, { channelData }: { channelData?: any } = {}) => {
      const { current: sendBoxAttachments } = sendBoxAttachmentsRef;

      trackEvent('submitSendBox', {
        ...(method ? { method } : {}),
        numFiles: sendBoxAttachments.length,
        // eslint-disable-next-line no-magic-numbers
        sumSizeInKB: Math.round(sendBoxAttachments.reduce((total, { blob: { size } }) => total + size, 0) / 1024)
      });

      return submitSendBox(method, channelData && { channelData });
    },
    [sendBoxAttachmentsRef, submitSendBox, trackEvent]
  );
}
