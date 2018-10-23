import React from 'react';

import CarouselLayout from '../../Activity/CarouselLayout';
import StackedLayout from '../../Activity/StackedLayout';

const RETURN_FALSE = () => false;

export default function () {
  return () => next => ({ activity, showTimestamp }) => {
    // TODO: [P4] Can we simplify these if-statement to something more readable?

    if (activity.type === 'typing' && activity.from.role === 'user') {
      // Do not show typing by oneself
      return RETURN_FALSE;
    }

    if (activity.type === 'message' || activity.type === 'typing') {
      if (
        activity.type === 'message'
        && (activity.attachments || []).length > 1
        && activity.attachmentLayout === 'carousel'
      ) {
        return children => <CarouselLayout activity={ activity } showTimestamp={ showTimestamp }>{ children }</CarouselLayout>;
      } else {
        return children => <StackedLayout activity={ activity } showTimestamp={ showTimestamp }>{ children }</StackedLayout>;
      }
    } else {
      return next({ activity, showTimestamp });
    }
  };
}
