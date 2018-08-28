import React from 'react';

import CarouselLayout from './CarouselLayout';
import StackedLayout from './StackedLayout';

function fromUser(activity) {
  return !!activity.from && activity.from.role === 'user';
}

export default ({ activity, children }) =>
  ((activity.attachments || []).length > 1 && activity.attachmentLayout === 'carousel') ?
    <CarouselLayout activity={ activity }>
      { children }
    </CarouselLayout>
  :
    <StackedLayout activity={ activity } fromUser={ fromUser(activity) }>
      { children }
    </StackedLayout>
