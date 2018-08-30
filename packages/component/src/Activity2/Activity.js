import React from 'react';

import CarouselLayout from './CarouselLayout';
import StackedLayout from './StackedLayout';

// TODO: For multi-user support, We should check against "userID" instead of "role"
function fromUser(activity) {
  return !!activity.from && activity.from.role === 'user';
}

export default ({ activity, children }) =>
  // Do not show typing by myself
  !(fromUser(activity) && activity.type === 'typing') && (
    ((activity.attachments || []).length > 1 && activity.attachmentLayout === 'carousel') ?
      <CarouselLayout activity={ activity }>
        { children }
      </CarouselLayout>
    :
      <StackedLayout activity={ activity } fromUser={ fromUser(activity) }>
        { children }
      </StackedLayout>
  )
