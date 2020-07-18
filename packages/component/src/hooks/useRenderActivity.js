import { useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function useRenderActivity(renderAttachment) {
  const { activityRenderer } = useContext(WebChatUIContext);

  if (typeof renderAttachment !== 'undefined') {
    // TODO: Fill out the blank
    console.warn('botframework-webchat: "renderAttachment" argument is deprecated. TBC.');
  }

  // if (typeof renderAttachment !== 'function') {
  //   throw new Error('botframework-webchat: First argument passed to "useRenderActivity" must be a function.');
  // }

  return activityRenderer;

  // return useCallback(
  //   ({ activity, ...renderActivityArgs }) =>
  //     activityRenderer({
  //       activity,
  //       ...renderActivityArgs
  //     })(renderAttachmentArgs =>
  //       renderAttachment({
  //         activity,
  //         ...renderAttachmentArgs
  //       })
  //     ),
  //   [activityRenderer, renderAttachment]
  // );
}
