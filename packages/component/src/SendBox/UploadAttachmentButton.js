import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { withStyleSet } from '../Context';
import AttachmentIcon from './Assets/AttachmentIcon';

const ROOT_CSS = css({
  overflow: 'hidden',
  position: 'relative',

  '& > input': {
    cursor: 'pointer',
    height: '100%',
    opacity: 0,
    position: 'absolute',
    right: 0,
    top: 0
  },

  '& > .icon': {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    height: '100%'
  }
});

export default withStyleSet(({ styleSet }) =>
  <div className={ classNames(ROOT_CSS + '', styleSet.uploadButton + '') }>
    <input type="file" />
    <div className="icon">
      <AttachmentIcon />
    </div>
  </div>
)
