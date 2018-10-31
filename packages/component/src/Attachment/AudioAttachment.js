import React from 'react';

import AudioContent from './AudioContent';
import connectToWebChat from '../connectToWebChat';

export default connectToWebChat(
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
