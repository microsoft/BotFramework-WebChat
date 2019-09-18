import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useRenderActivity() {
  const { activityRenderer } = useContext(WebChatUIContext);

  return [
    ({ activity, renderAttachment, ...renderActivityArgs }) =>
      activityRenderer({
        activity,
        ...renderActivityArgs
      })(renderAttachmentArgs =>
        renderAttachment({
          activity,
          ...renderAttachmentArgs
        })
      ),
    () => {
      throw new Error('ActivityRenderer must be set using props.');
    }
  ];
}
