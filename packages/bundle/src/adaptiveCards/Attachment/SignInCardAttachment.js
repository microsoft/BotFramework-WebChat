import React from 'react';

import { connectToWebChat } from 'botframework-webchat-component';

import CommonCard from './CommonCard';

export default connectToWebChat(
  ({ styleSet }) => ({ styleSet })
)(
  ({
    adaptiveCards,
    attachment,
    styleSet
  }) =>
    <div className={ styleSet.animationCardAttachment }>
      <CommonCard
        adaptiveCards={ adaptiveCards }
        attachment={ attachment }
      />
    </div>
)
