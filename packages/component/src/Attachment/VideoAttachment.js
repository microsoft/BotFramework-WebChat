import React from 'react';

import VideoContent from './VideoContent';
import { withStyleSet } from '../Context';

export default withStyleSet(({ attachment, styleSet }) =>
  <div className={ styleSet.videoAttachment }>
    <VideoContent
      alt={ attachment.name }
      src={ attachment.contentUrl }
    />
  </div>
)
