import React from 'react';

import ImBackButton from './ImBackButton';
import MessageBackButton from './MessageBackButton';
import PostBackButton from './PostBackButton';

// "cardAction" could be either, "imBack", "messageBack", or "postBack".
export default ({ cardAction }) => {
  switch (cardAction.type) {
    case 'messageBack':
      return <MessageBackButton cardAction={cardAction} />;

    case 'postBack':
      return <PostBackButton cardAction={cardAction} />;

    default:
      return <ImBackButton cardAction={cardAction} />;
  }
};
