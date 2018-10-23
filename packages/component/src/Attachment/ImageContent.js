import React from 'react';

import connectWithContext from '../connectWithContext';
import CroppedImage from '../Utils/CroppedImage';

export default connectWithContext(
  ({ styleSet }) => ({ styleSet })
)(
  ({
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
