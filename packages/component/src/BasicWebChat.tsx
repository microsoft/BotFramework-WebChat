import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import BasicSendBox from './SendBox/BasicSendBox';
import BasicTranscript from './Transcript/BasicTranscript';

const ROOT_CSS = css({
  backgroundColor: '#EEE',
  display: 'flex',
  flexDirection: 'column',

  '& > .filler': {
    flex: 1
  }
});

const TRANSCRIPT_CSS = css({
});

export default props =>
  <div className={ classNames(ROOT_CSS + '', props.className + '') }>
    <div className="filler" />
    <BasicTranscript className={ TRANSCRIPT_CSS } />
    <BasicSendBox />
  </div>
