import React from 'react';

import MicrophoneButton from './MicrophoneButton';
import TextBox from './TextBox';
import UploadAttachmentButton from './UploadAttachmentButton';

export default class BasicSendBox extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <UploadAttachmentButton />
        <TextBox />
        <MicrophoneButton />
      </div>
    );
  }
}
