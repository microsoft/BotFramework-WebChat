import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { withStyleSet } from '../Context';
import SendBoxComposer from './Composer';
import SuggestedActions from './SuggestedActions';
import TextBoxWithSpeech from './TextBoxWithSpeech';
import UploadAttachmentButton from './UploadAttachmentButton';

const ROOT_CSS = css({
  '& > .main': {
    display: 'flex'
  }
});

const TEXT_BOX_CSS = css({
  flex: 1
});

export default withStyleSet(({ className, styleSet }) =>
  <SendBoxComposer>
    <div className={ classNames(
      styleSet.sendBox + '',
      ROOT_CSS + '',
      (className || '') + ''
    ) }>
      <SuggestedActions />
      <div className="main">
        <UploadAttachmentButton />
        <TextBoxWithSpeech className={ TEXT_BOX_CSS } />
      </div>
    </div>
  </SendBoxComposer>
)
