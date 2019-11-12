// This is required for aria-controls.
/* eslint react/forbid-dom-props: "off" */

import { Constants } from 'botframework-webchat-core';
import { css } from 'glamor';
import classNames from 'classnames';
import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import IconButton from './IconButton';
import MicrophoneIcon from './Assets/MicrophoneIcon';
import useLocalize from '../hooks/useLocalize';
import useStyleSet from '../hooks/useStyleSet';

const { DictateState } = Constants;

const ROOT_CSS = css({
  display: 'flex',
  height: '100%',

  // .sr-only - This component is intended to be invisible to the visual Web Chat user, but read by the AT when using a screen reader

  '& > .sr-only': {
    color: 'transparent',
    height: 1,
    left: -10000,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    whiteSpace: 'nowrap',
    width: 1
  }
});

const connectMicrophoneButton = (...selectors) => {
  const primeSpeechSynthesis = memoize((speechSynthesis, SpeechSynthesisUtterance) => {
    if (speechSynthesis && SpeechSynthesisUtterance) {
      const utterance = new SpeechSynthesisUtterance('');

      [utterance.voice] = speechSynthesis.getVoices();
      speechSynthesis.speak(utterance);
    }
  });

  return connectToWebChat(
    ({
      disabled,
      dictateInterims,
      dictateState,
      language,
      setSendBox,
      startDictate,
      stopDictate,
      stopSpeakingActivity,
      webSpeechPonyfill: { speechSynthesis, SpeechSynthesisUtterance } = {}
    }) => ({
      click: () => {
        if (dictateState === DictateState.WILL_START) {
          stopSpeakingActivity();
        } else if (dictateState === DictateState.DICTATING) {
          stopDictate();
          setSendBox(dictateInterims.join(' '));
        } else {
          stopSpeakingActivity();
          startDictate();
        }

        primeSpeechSynthesis(speechSynthesis, SpeechSynthesisUtterance);
      },
      dictating: dictateState === DictateState.DICTATING,
      disabled: disabled || (dictateState === DictateState.STARTING && dictateState === DictateState.STOPPING),
      language
    }),
    ...selectors
  );
};

const MicrophoneButton = ({ className, click, dictating, disabled }) => {
  const [{ microphoneButton: microphoneButtonStyleSet }] = useStyleSet();
  const iconButtonAltText = useLocalize('Speak');
  const screenReaderText = useLocalize(dictating ? 'Microphone on' : 'Microphone off');

  return (
    <div
      aria-controls="webchatSendBoxMicrophoneButton"
      className={classNames(microphoneButtonStyleSet + '', ROOT_CSS + '', className + '', { dictating })}
    >
      <IconButton alt={iconButtonAltText} disabled={disabled} onClick={click}>
        <MicrophoneIcon />
      </IconButton>
      <div aria-live="polite" className="sr-only" id="webchatSendBoxMicrophoneButton" role="status">
        {screenReaderText}
      </div>
    </div>
  );
};

MicrophoneButton.defaultProps = {
  className: '',
  dictating: false,
  disabled: false
};

MicrophoneButton.propTypes = {
  className: PropTypes.string,
  click: PropTypes.func.isRequired,
  dictating: PropTypes.bool,
  disabled: PropTypes.bool
};

export default connectMicrophoneButton()(MicrophoneButton);

export { connectMicrophoneButton };
