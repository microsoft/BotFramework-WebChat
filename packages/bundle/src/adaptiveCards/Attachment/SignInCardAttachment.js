import React from 'react';

import CommonCard from './CommonCard';
import { connectToWebChat } from 'botframework-webchat-component';

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
