import { useCallback, useContext } from 'react';

import useRenderAttachment from '../useRenderAttachment';
import WebChatUIContext from '../../WebChatUIContext';

export default function useCreateActivityRendererInternal(renderAttachmentOverride) {
  const { activityRenderer: createActivityRenderer } = useContext(WebChatUIContext);
  const defaultRenderAttachment = useRenderAttachment();

  const renderAttachment = renderAttachmentOverride || defaultRenderAttachment;

  return useCallback(
    createActivityRendererOptions => {
      const renderActivity = createActivityRenderer(createActivityRendererOptions);

      if (!renderActivity) {
        return false;
      }

      return renderActivityOptions => {
        const activityElement = renderActivity(renderAttachment, renderActivityOptions);

        // "activityElement" cannot be false. If the middleware want to hide the "activityElement", it should return "false" when we call createActivityRenderer().
        activityElement ||
          console.warn(
            'botframework-webchat: To hide an activity, the activity renderer should return false. It should not return a function that will return false when called.'
          );

        return activityElement;
      };
    },
    [createActivityRenderer, renderAttachment]
  );
}
