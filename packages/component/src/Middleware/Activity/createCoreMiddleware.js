import React from 'react';

import CarouselLayout from '../../Activity2/CarouselLayout';
import StackedLayout from '../../Activity2/StackedLayout';

const RETURN_FALSE = () => false;

export default function () {
  return () => next => ({ activity, showTimestamp }) => {
    if (!activity) {
      return RETURN_FALSE;
    } else if (activity.type === 'message') {
      const { attachments = [], text } = activity;

      if (!text && !attachments.length) {
        // Do not show empty bubbles (no text and attachments, and not "typing")
        return RETURN_FALSE;
      }
    } else if (activity.type === 'typing') {
      if (activity.from.role === 'user') {
        // Do not show typing by oneself
        return RETURN_FALSE;
      }
    } else if (activity.type === 'event') {
        return RETURN_FALSE;
    } else {
      // Do not show carousel/stacked if it is not activity.type === 'message' or 'typing'
      return next({ activity, showTimestamp });
    }

    if ((activity.attachments || []).length > 1 && activity.attachmentLayout === 'carousel') {
      return children => <CarouselLayout activity={ activity } showTimestamp={ showTimestamp }>{ children }</CarouselLayout>;
    } else {
      return children => <StackedLayout activity={ activity } showTimestamp={ showTimestamp }>{ children }</StackedLayout>;
    }
  };
}
