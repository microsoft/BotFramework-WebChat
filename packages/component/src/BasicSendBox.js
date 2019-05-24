import { Constants } from 'botframework-webchat-core';
import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import ConnectivityStatus from './SendBox/ConnectivityStatus';
import connectToWebChat from './connectToWebChat';
import DictationInterims from './SendBox/DictationInterims';
import MicrophoneButton from './SendBox/MicrophoneButton';
import SendButton from './SendBox/SendButton';
import SuggestedActions from './SendBox/SuggestedActions';
import TextBox from './SendBox/TextBox';
import UploadButton from './SendBox/UploadButton';

const {
  DictateState: { DICTATING, STARTING }
} = Constants;

const ROOT_CSS = css({
  '& > .main': {
    display: 'flex'
  }
});

const DICTATION_INTERIMS_CSS = css({ flex: 10000 });
const MICROPHONE_BUTTON_CSS = css({ flex: 1 });
const TEXT_BOX_CSS = css({ flex: 10000 });

const BasicSendBox = ({ className, dictationStarted, styleSet, webSpeechPonyfill }) => (
  <div className={classNames(styleSet.sendBox + '', ROOT_CSS + '', className + '')} role="form">
    <ConnectivityStatus />
    <SuggestedActions />
    <div className="main">
      {!styleSet.options.hideUploadButton && <UploadButton />}
      {dictationStarted ? (
        <DictationInterims className={DICTATION_INTERIMS_CSS + ''} />
      ) : (
        <TextBox className={TEXT_BOX_CSS + ''} />
      )}
      <div>
        {(webSpeechPonyfill || {}).SpeechRecognition ? (
          <MicrophoneButton className={MICROPHONE_BUTTON_CSS + ''} />
        ) : (
          <SendButton />
        )}
      </div>
    </div>
  </div>
);

BasicSendBox.defaultProps = {
  className: '',
  dictationStarted: false,
  webSpeechPonyfill: undefined
};

BasicSendBox.propTypes = {
  className: PropTypes.string,
  dictationStarted: PropTypes.bool,
  styleSet: PropTypes.shape({
    sendBox: PropTypes.any.isRequired
  }).isRequired,
  webSpeechPonyfill: PropTypes.shape({
    SpeechRecognition: PropTypes.any
  })
};

export default connectToWebChat(({ dictateState, styleSet, webSpeechPonyfill }) => ({
  dictationStarted: dictateState === STARTING || dictateState === DICTATING,
  styleSet,
  webSpeechPonyfill
}))(BasicSendBox);
