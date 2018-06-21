import { css } from 'glamor';
import React from 'react';

import MicrophoneButton from './MicrophoneButton';
import TextBox from './TextBox';
import UploadAttachmentButton from './UploadAttachmentButton';

const ROOT_CSS = css({
  backgroundColor: 'White',
  boxShadow: '0 0 5px rgba(0, 0, 0, .1)',
  display: 'flex',
  height: 40
});

const TEXT_BOX_CSS = css({
  flex: 1
});

export default class BasicSendBox extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={ ROOT_CSS }>
        <UploadAttachmentButton />
        <TextBox className={ TEXT_BOX_CSS } />
        <MicrophoneButton />
      </div>
    );
  }
}
