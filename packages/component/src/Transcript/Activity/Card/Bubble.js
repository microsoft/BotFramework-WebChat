import classNames from 'classnames';
import React from 'react';

import CroppedImage from '../../../Utils/CroppedImage';
import MainContext from '../../../Context';

export default props =>
  <MainContext.Consumer>
    { ({ styleSet }) =>
      <div className={ classNames(styleSet.bubble + '', (props.className || '') + '') }>
        { !!props.image &&
          <CroppedImage
            height={ styleSet.options.bubbleImageHeight }
            src={ props.image }
            width="100%"
          />
        }
        <div className="content">
          { props.children }
        </div>
      </div>
    }
  </MainContext.Consumer>
