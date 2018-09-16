import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import connectWithContext from '../connectWithContext';
import MicrophoneButton from './MicrophoneButton';
import SendButton from './SendButton';
import SuggestedActions from './SuggestedActions';
import TextBox from './TextBox';
import UploadAttachmentButton from './UploadAttachmentButton';

const ROOT_CSS = css({
  '& > .main': {
    display: 'flex'
  }
});

const MICROPHONE_BUTTON_CSS = css({
  flex: 1
});

const TEXT_BOX_CSS = css({
  flex: 10000
});

const BasicSendBox = ({
  className,
  enableSpeech,
  speechState,
  styleSet,
  webSpeechPonyfill
}) =>
  <div className={ classNames(
    styleSet.sendBox + '',
    ROOT_CSS + '',
    (className || '') + ''
  ) }>
    <SuggestedActions />
    <div className="main">
      <UploadAttachmentButton />
      { !speechState &&
          <TextBox className={ TEXT_BOX_CSS } />
      }
      { (enableSpeech && webSpeechPonyfill && webSpeechPonyfill.SpeechRecognition) ?
          <MicrophoneButton className={ MICROPHONE_BUTTON_CSS } />
        :
          <SendButton />
      }
    </div>
  </div>


export default connectWithContext(
  ({ input: { speechState } }) => ({ speechState }),
  ({ enableSpeech, styleSet, webSpeechPonyfill }) => ({ enableSpeech, styleSet, webSpeechPonyfill })
)(BasicSendBox)
