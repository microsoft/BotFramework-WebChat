import React from 'react';

import TextContent from './TextContent';

export default ({ attachment }) =>
  <TextContent
    text={ attachment.content.text }
    contentType={ attachment.contentType }
  />
