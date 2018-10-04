import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import connectWithContext from '../connectWithContext';
import DictationInterims from './DictationInterims';
import MicrophoneButton from './MicrophoneButton';
import SendButton from './SendButton';
import SuggestedActions from './SuggestedActions';
import TextBox from './TextBox';
import UploadAttachmentButton from './UploadAttachmentButton';

import { Constants } from 'botframework-webchat-core';

const { DictateState } = Constants;

const ROOT_CSS = css({
  '& > .main': {
    display: 'flex'
  }
});

const DICTATION_INTERIMS_CSS = css({ flex: 10000 });
const MICROPHONE_BUTTON_CSS = css({ flex: 1 });
const TEXT_BOX_CSS = css({ flex: 10000 });

const BasicSendBox = ({
  className,
  dictationStarted,
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
      { dictationStarted ?
          <DictationInterims className={ DICTATION_INTERIMS_CSS } />
        :
          <TextBox className={ TEXT_BOX_CSS } />
      }
      { (webSpeechPonyfill && webSpeechPonyfill.SpeechRecognition) ?
          <MicrophoneButton className={ MICROPHONE_BUTTON_CSS } />
        :
          <SendButton />
      }
    </div>
  </div>


export default connectWithContext(
  ({ input: { dictateState } }) => ({
    dictationStarted: dictateState === DictateState.STARTING || dictateState === DictateState.DICTATING
  }),
  ({ styleSet, webSpeechPonyfill }) => ({ styleSet, webSpeechPonyfill })
)(BasicSendBox)
