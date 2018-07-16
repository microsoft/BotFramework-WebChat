import { css } from 'glamor';
import React from 'react';

import { withStyleSet } from '../Context';
import CroppedImage from '../Utils/CroppedImage';
import PlainText from './PlainText';

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
    <PlainText attachment={ attachment } />
  </div>
)
