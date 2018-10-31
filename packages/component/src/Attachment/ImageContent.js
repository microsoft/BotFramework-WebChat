import React from 'react';

import connectToWebChat from '../connectToWebChat';
import CroppedImage from '../Utils/CroppedImage';

export default connectToWebChat(
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
