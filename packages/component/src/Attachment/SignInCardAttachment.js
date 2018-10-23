import React from 'react';

import CommonCard from './CommonCard';
import connectWithContext from '../connectWithContext';

export default connectWithContext(
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
