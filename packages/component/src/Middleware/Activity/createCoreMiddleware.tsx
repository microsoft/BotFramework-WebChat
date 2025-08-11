/* eslint complexity: ["error", 21] */
import { ActivityMiddleware } from 'botframework-webchat-api';
import { getActivityLivestreamingMetadata, getOrgSchemaMessage } from 'botframework-webchat-core';
import React from 'react';

import CarouselLayout from '../../Activity/CarouselLayout';
import StackedLayout from '../../Activity/StackedLayout';

export default function createCoreMiddleware(): ActivityMiddleware[] {
  return [
    () =>
      next =>
      (...args) => {
        const [{ activity }] = args;

        // TODO: [P4] Can we simplify these if-statement to something more readable?

        const { type } = activity;
        const messageThing = getOrgSchemaMessage(activity.entities);

        // Filter out activities that should not visible.
        if (
          type === 'conversationUpdate' ||
          type === 'event' ||
          type === 'invoke' ||
          // Do not show content for contentless livestream interims, or finalized activity without content.
          (type === 'typing' &&
            (getActivityLivestreamingMetadata(activity)?.type === 'contentless' ||
              !(activity['text'] || activity.attachments?.length > 0 || messageThing?.abstract))) ||
          (type === 'message' &&
            // Do not show postback
            (activity.channelData?.postBack ||
              // Do not show messageBack if displayText is undefined
              (activity.channelData?.messageBack && !activity.channelData.messageBack.displayText) ||
              // Do not show empty bubbles (no text and attachments)
              !(activity.text || activity.attachments?.length || messageThing?.abstract)))
        ) {
          return false;
        } else if (type === 'message' || type === 'typing') {
          if ((activity.attachments?.length || 0) > 1 && activity.attachmentLayout === 'carousel') {
            // The following line is not a React functional component, it's a render function called by useCreateActivityRenderer() hook.
            // The function signature need to be compatible with older version of activity middleware, which was:
            //
            // renderActivity(
            //   renderAttachment: ({ activity, attachment }) => React.Element
            // ) => React.Element

            return function renderCarouselLayout(renderAttachment, props) {
              typeof props === 'undefined' &&
                console.warn(
                  'botframework-webchat: One or more arguments were missing after passing through the activity middleware. Please check your custom activity middleware to make sure it passes all arguments.'
                );

              return <CarouselLayout activity={activity} renderAttachment={renderAttachment} {...props} />;
            };
          }

          // The following line is not a React functional component, it's a render function called by useCreateActivityRenderer() hook.
          return function renderStackedLayout(renderAttachment, props) {
            typeof props === 'undefined' &&
              console.warn(
                'botframework-webchat: One or more arguments were missing after passing through the activity middleware. Please check your custom activity middleware to make sure it passes all arguments.'
              );

            return <StackedLayout activity={activity} renderAttachment={renderAttachment} {...props} />;
          };
        }

        return next(...args);
      }
  ];
}
