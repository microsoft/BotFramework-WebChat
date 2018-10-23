import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import connectWithContext from './connectWithContext';
import DictationInterims from './SendBox/DictationInterims';
import MicrophoneButton from './SendBox/MicrophoneButton';
import SendButton from './SendBox/SendButton';
import SuggestedActions from './SendBox/SuggestedActions';
import TextBox from './SendBox/TextBox';
import UploadAttachmentButton from './SendBox/UploadAttachmentButton';

import { Constants } from 'botframework-webchat-core';

const {
  DictateState: {
    DICTATING,
    STARTING
  }
} = Constants;

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
  webSpeechPonyfill = {}
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
      { webSpeechPonyfill.SpeechRecognition ?
          <MicrophoneButton className={ MICROPHONE_BUTTON_CSS } />
        :
          <SendButton />
      }
    </div>
  </div>

export default connectWithContext(
  ({
    dictateState,
    styleSet,
    webSpeechPonyfill
  }) => ({
    dictationStarted: dictateState === STARTING || dictateState === DICTATING,
    styleSet,
    webSpeechPonyfill
  })
)(BasicSendBox)
