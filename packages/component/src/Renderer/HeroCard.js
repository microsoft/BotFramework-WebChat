import { css } from 'glamor';
import React from 'react';

import { withStyleSet } from '../Context';
import CroppedImage from '../Utils/CroppedImage';
import TextCard from './TextCard';

const ROOT_CSS = css({
});

export default withStyleSet(({ card, styleSet }) =>
  <div className={ ROOT_CSS }>
    { !!card.attachment &&
      <CroppedImage
        height={ styleSet.options.bubbleImageHeight }
        src={ card.attachment }
        width="100%"
      />
    }
    <TextCard card={ card } />
  </div>
)
