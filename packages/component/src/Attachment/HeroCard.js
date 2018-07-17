import React from 'react';

import { withStyleSet } from '../Context';
import CroppedImage from '../Utils/CroppedImage';
import TextCard from './TextCard';

export default withStyleSet(({ attachment, styleSet }) =>
  <div>
    { !!(attachment.content.images && attachment.content.images.length) &&
      <CroppedImage
        height={ styleSet.options.bubbleImageHeight }
        src={ attachment.content.images[0].url }
        width="100%"
      />
    }
    <TextCard attachment={ attachment } />
  </div>
)
