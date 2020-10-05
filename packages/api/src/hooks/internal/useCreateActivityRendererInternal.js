import { isValidElement, useMemo } from 'react';

import useCreateAttachmentRenderer from '../useCreateAttachmentRenderer';
import useWebChatAPIContext from './useWebChatAPIContext';

export default function useCreateActivityRendererInternal(createAttachmentRendererOverride) {
  const { activityRenderer: createActivityRenderer } = useWebChatAPIContext();
  const defaultCreateAttachmentRenderer = useCreateAttachmentRenderer();

  const createAttachmentRenderer = createAttachmentRendererOverride || defaultCreateAttachmentRenderer;

  return useMemo(
    () => (...createActivityRendererOptions) => {
      const renderActivity = createActivityRenderer(...createActivityRendererOptions);

      if (!renderActivity) {
        return false;
      }

      return renderActivityOptions => {
        if (isValidElement(renderActivity)) {
          return renderActivity;
        }

        const activityElement = renderActivity(
          (...renderAttachmentArgs) => createAttachmentRenderer(...renderAttachmentArgs),
          renderActivityOptions
        );

        // "activityElement" cannot be false. If the middleware want to hide the "activityElement", it should return "false" when we call createActivityRenderer().
        activityElement ||
          console.warn(
            'botframework-webchat: To hide an activity, the activity renderer should return false. It should not return a function that will return false when called.'
          );

        return activityElement;
      };
    },
    [createActivityRenderer, createAttachmentRenderer]
  );
}
