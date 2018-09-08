import React from 'react';

import CarouselLayout from './CarouselLayout';
import StackedLayout from './StackedLayout';

// TODO: For multi-user support, We should check against "userID" instead of "role"
function fromUser(activity) {
  return !!activity.from && activity.from.role === 'user';
}

// TODO: Refactor it into activity middleware stack
export default ({ activity, children }) =>
  // Do not show typing by myself
  !(fromUser(activity) && activity.type === 'typing')
  // Do not show empty bubbles (no text and attachments, and not "typing")
  && !!(activity.text || (activity.attachments && activity.attachments.length) || activity.type === 'typing')
  && (
    ((activity.attachments || []).length > 1 && activity.attachmentLayout === 'carousel') ?
      <CarouselLayout activity={ activity }>
        { children }
      </CarouselLayout>
    :
      <StackedLayout activity={ activity } fromUser={ fromUser(activity) }>
        { children }
      </StackedLayout>
  )
