import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import BasicSendBox from './SendBox/BasicSendBox';
import BasicTranscript from './Transcript/BasicTranscript';

const ROOT_CSS = css({
  backgroundColor: '#EEE',
  display: 'flex',
  flexDirection: 'column'
});

const TRANSCRIPT_CSS = css({
  flex: 1,
  overflowY: 'auto'
});

const SEND_BOX_CSS = css({
  flexShrink: 0
});

export default props =>
  <div className={ classNames(ROOT_CSS + '', (props.className || '') + '') }>
    <BasicTranscript className={ TRANSCRIPT_CSS } />
    <BasicSendBox className={ SEND_BOX_CSS } />
  </div>
