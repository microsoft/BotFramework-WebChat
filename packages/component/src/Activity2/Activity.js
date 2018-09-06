import React from 'react';

import CarouselLayout from './CarouselLayout';
import StackedLayout from './StackedLayout';

// TODO: For multi-user support, We should check against "userID" instead of "role"
// TODO: We should always fill in "role", so we can simplify the "is it from me?" check every where
function fromUser(activity) {
  return !!activity.from && activity.from.role === 'user';
}

export default ({ activity, children }) =>
  // Do not show typing by myself
  !(fromUser(activity) && activity.type === 'typing')
  // Do not show empty bubbles (no text and attachments)
  && !!(activity.text || (activity.attachments && activity.attachments.length))
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
