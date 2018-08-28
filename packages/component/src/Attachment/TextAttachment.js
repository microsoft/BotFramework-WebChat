import React from 'react';

import TextContent from './TextContent';

export default ({ attachment }) =>
  !!(attachment.content && attachment.content.text) &&
    <TextContent
      text={ attachment.content.text }
      contentType={ attachment.contentType }
    />
