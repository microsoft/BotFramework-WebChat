import React from 'react';

import { withStyleSet } from '../Context';
import CroppedImage from '../Utils/CroppedImage';

export default withStyleSet(({
  attachment,
  styleSet
}) =>
  <CroppedImage
    alt={ attachment.name }
    height={ styleSet.options.bubbleImageHeight }
    src={ attachment.contentUrl }
    width="100%"
  />
)
