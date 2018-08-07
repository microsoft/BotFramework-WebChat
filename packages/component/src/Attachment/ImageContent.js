import React from 'react';

import { withStyleSet } from '../Context';
import CroppedImage from '../Utils/CroppedImage';

export default withStyleSet(({
  alt,
  src,
  styleSet
}) =>
  <CroppedImage
    alt={ alt }
    height={ styleSet.options.bubbleImageHeight }
    src={ src }
    width="100%"
  />
)
