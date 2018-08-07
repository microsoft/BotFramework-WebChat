import React from 'react';

import AudioContent from './AudioContent';
import { withStyleSet } from '../Context';

export default withStyleSet(({ attachment, styleSet }) =>
  <div className={ styleSet.audioAttachment }>
    <AudioContent
      src={ attachment.contentUrl }
    />
  </div>
)
