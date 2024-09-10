import React, { memo } from 'react';

import type { CardAction } from './CardAction';
import ImBackButton from './ImBackButton';
import MessageBackButton from './MessageBackButton';
import PostBackButton from './PostBackButton';

// "cardAction" could be either, "imBack", "messageBack", or "postBack".
function CardActionButton({ cardAction }: Readonly<{ cardAction: CardAction }>) {
  switch (cardAction.type) {
    case 'messageBack':
      return <MessageBackButton cardAction={cardAction} />;

    case 'postBack':
      return <PostBackButton cardAction={cardAction} />;

    default:
      return <ImBackButton cardAction={cardAction} />;
  }
}

export default memo(CardActionButton);
