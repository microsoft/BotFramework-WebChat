import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import SendBoxComposer from './Composer';
import SuggestedActions from './SuggestedActions';
import TextBoxWithSpeech from './TextBoxWithSpeech';
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

export default props =>
  <SendBoxComposer>
    <div className={ classNames(ROOT_CSS + '', (props.className || '') + '') }>
      <SuggestedActions />
      <div className="main">
        <UploadAttachmentButton />
        <TextBoxWithSpeech className={ TEXT_BOX_CSS } />
      </div>
    </div>
  </SendBoxComposer>
