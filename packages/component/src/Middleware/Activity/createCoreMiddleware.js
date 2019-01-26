import React from 'react';

import CarouselLayout from '../../Activity/CarouselLayout';
import StackedLayout from '../../Activity/StackedLayout';

const RETURN_FALSE = () => false;

export default function () {
  return () => next => ({ activity, timestampClassName }) => {
    // TODO: [P4] Can we simplify these if-statement to something more readable?

    const { type } = activity;

    // Filter out activities that should not be visible
    if (type === 'conversationUpdate' || type === 'event') {
      return RETURN_FALSE;
    } else if (type === 'message') {
      const { attachments = [], text } = activity;

      if (
        // Do not show postback
        (activity.channelData && activity.channelData.postBack)
        // Do not show messageBack if displayText is undefined
        || (activity.channelData && activity.channelData.messageBack && !activity.channelData.messageBack.displayText)
        // Do not show empty bubbles (no text and attachments, and not "typing")
        || !(text || attachments.length)
      ) {
        return RETURN_FALSE;
      }
    } else if (type === 'typing' && activity.from.role === 'user') {
      // Do not show typing by oneself
      return RETURN_FALSE;
    }

    if (type === 'message' || type === 'typing') {
      if (
        type === 'message'
        && (activity.attachments || []).length > 1
        && activity.attachmentLayout === 'carousel'
      ) {
        return children => <CarouselLayout activity={ activity } timestampClassName={ timestampClassName }>{ children }</CarouselLayout>;
      } else {
        return children => <StackedLayout activity={ activity } timestampClassName={ timestampClassName }>{ children }</StackedLayout>;
      }
    } else {
      return next({ activity, timestampClassName });
    }
  };
}
