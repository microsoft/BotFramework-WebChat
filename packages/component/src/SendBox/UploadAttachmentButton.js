import { css } from 'glamor';
import React from 'react';

import AttachmentIcon from './Assets/AttachmentIcon';

const ROOT_CSS = css({
  overflow: 'hidden',
  position: 'relative',
  width: 40,

  '& > input': {
    height: '100%',
    left: 0,
    opacity: .2,
    position: 'absolute',
    top: 0,
    width: '100%'
  },

  '& > .icon': {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    height: '100%'
  }
});

export default class UploadAttachmentButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={ ROOT_CSS }>
        <input type="file" />
        <div className="icon">
          <AttachmentIcon />
        </div>
      </div>
    );
  }
}
