import React from 'react';

import TextContent from './TextContent';

export default ({ attachment }) =>
  !!attachment.content &&
    <TextContent
      text={ attachment.content }
      contentType={ attachment.contentType }
    />
