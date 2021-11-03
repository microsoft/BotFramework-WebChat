import { isValidElement, useMemo } from 'react';

import { ActivityComponentFactory } from '../../types/ActivityMiddleware';
import { RenderAttachment } from '../../types/AttachmentMiddleware';
import useRenderAttachment from '../useRenderAttachment';
import useWebChatAPIContext from './useWebChatAPIContext';

export default function useCreateActivityRendererInternal(
  renderAttachmentOverride?: RenderAttachment
): ActivityComponentFactory {
  const { activityRenderer: createActivityRenderer } = useWebChatAPIContext();
  const defaultRenderAttachment = useRenderAttachment();

  const renderAttachment: RenderAttachment = renderAttachmentOverride || defaultRenderAttachment;

  return useMemo(
    () =>
      (...createActivityRendererOptions) => {
        const renderActivity = createActivityRenderer(...createActivityRendererOptions);

        if (!renderActivity) {
          return false;
        }

        return renderActivityOptions => {
          if (isValidElement(renderActivity)) {
            return renderActivity;
          }

          const activityElement = renderActivity(
            (...renderAttachmentArgs) => renderAttachment(...renderAttachmentArgs),
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
    [createActivityRenderer, renderAttachment]
  );
}
