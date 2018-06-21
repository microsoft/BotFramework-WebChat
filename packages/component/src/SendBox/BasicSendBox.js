import { css } from 'glamor';
import React from 'react';

import MicrophoneButton from './MicrophoneButton';
import SuggestedAction from './SuggestedAction';
import SuggestedActions from './SuggestedActions2';
import TextBox from './TextBox';
import UploadAttachmentButton from './UploadAttachmentButton';

const ROOT_CSS = css({
  '& > .main': {
    backgroundColor: 'White',
    boxShadow: '0 0 5px rgba(0, 0, 0, .1)',
    display: 'flex',
    height: 40
  }
});

const TEXT_BOX_CSS = css({
  flex: 1
});

export default class BasicSendBox extends React.Component {
  render() {
    return (
      <div className={ ROOT_CSS }>
        <SuggestedActions>
          <SuggestedAction>Action 01</SuggestedAction>
          <SuggestedAction>Action 02</SuggestedAction>
          <SuggestedAction>Action 03</SuggestedAction>
          <SuggestedAction>Action 04</SuggestedAction>
          <SuggestedAction>Action 05</SuggestedAction>
        </SuggestedActions>
        <div className="main">
          <UploadAttachmentButton />
          <TextBox className={ TEXT_BOX_CSS } />
          <MicrophoneButton />
        </div>
      </div>
    );
  }
}
