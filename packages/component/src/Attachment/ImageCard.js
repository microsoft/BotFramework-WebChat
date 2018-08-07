import React from 'react';

import ImageContent from './ImageContent';

export default ({ attachment }) =>
  <ImageContent
    alt={ attachment.name }
    src={ attachment.contentUrl }
  />
