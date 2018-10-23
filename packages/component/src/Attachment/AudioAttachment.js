import React from 'react';

import AudioContent from './AudioContent';
import connectWithContext from '../connectWithContext';

export default connectWithContext(
  ({ styleSet }) => ({ styleSet })
)(
  ({ attachment, styleSet }) =>
    <div className={ styleSet.audioAttachment }>
      <AudioContent
        alt={ attachment.name }
        src={ attachment.contentUrl }
      />
    </div>
)
