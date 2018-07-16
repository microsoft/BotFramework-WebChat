import classNames from 'classnames';
import React from 'react';

import { withStyleSet } from '../../Context';
import CroppedImage from '../../Utils/CroppedImage';

export default withStyleSet(({ children, className, image, styleSet }) =>
  <div className={ classNames(styleSet.bubble + '', (className || '') + '') }>
    { !!image &&
      <CroppedImage
        height={ styleSet.options.bubbleImageHeight }
        src={ image }
        width="100%"
      />
    }
    <div className="content">
      { children }
    </div>
  </div>
)
