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

        const activityElement = renderActivity((...renderAttachmentArgs) => {
          // Currently, the API signature for renderActivity is:
          //   renderActivity(({ activity, attachment }) => React.Element)
          // We will bridge newer version of createAttachmentRenderer to the older API for now.
          const result = createAttachmentRenderer(...renderAttachmentArgs);

          // return isValidElement(result) ? () => result : result;
          return isValidElement(result) ? result : result();
        }, renderActivityOptions);

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
