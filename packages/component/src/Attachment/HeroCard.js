import { css } from 'glamor';
import React from 'react';

import { withStyleSet } from '../Context';
import CroppedImage from '../Utils/CroppedImage';
import TextCard from './TextCard';

const ROOT_CSS = css({
});

export default withStyleSet(({ attachment, styleSet }) =>
  <div className={ ROOT_CSS }>
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
