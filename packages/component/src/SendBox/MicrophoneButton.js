// This is required for aria-controls.
/* eslint react/forbid-dom-props: "off" */

import { Constants } from 'botframework-webchat-core';
import { css } from 'glamor';
import classNames from 'classnames';
import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';

import { useLocalize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import IconButton from './IconButton';
import MicrophoneIcon from './Assets/MicrophoneIcon';
import useStyleSet from '../hooks/useStyleSet';
import useWebChat from '../useWebChat';

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
  console.warn(
    'Web Chat: connectMicrophoneButton() will be removed on or after 2021-09-27, please use useMicrophoneButton() instead.'
  );

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
      webSpeechPonyfill: { speechSynthesis, SpeechSynthesisUtterance } = {}
    }) => ({
      click: () => {
        if (dictateState === DictateState.STARTING || dictateState === DictateState.DICTATING) {
          stopDictate();
          setSendBox(dictateInterims.join(' '));
        } else {
          startDictate();
        }

        primeSpeechSynthesis(speechSynthesis, SpeechSynthesisUtterance);
      },
      dictating: dictateState === DictateState.DICTATING,
      disabled: disabled || (dictateState === DictateState.STARTING || dictateState === DictateState.STOPPING),
      language
    }),
    ...selectors
  );
};

const useMicrophoneButton = () => {
  const {
    disabled,
    dictateInterims,
    dictateState,
    setSendBox,
    startDictate,
    stopDictate,
    webSpeechPonyfill: { speechSynthesis, SpeechSynthesisUtterance } = {}
  } = useWebChat(state => state);

  const [primeSpeechSynthesis] = useState(() =>
    memoize((speechSynthesis, SpeechSynthesisUtterance) => {
      if (speechSynthesis && SpeechSynthesisUtterance) {
        const utterance = new SpeechSynthesisUtterance('');

        [utterance.voice] = speechSynthesis.getVoices();
        speechSynthesis.speak(utterance);
      }
    })
  );

  // TODO: [P2] We should revisit this function later
  //       The click() logic seems local to the component, but may not be generalized across all implementations.
  const click = useCallback(() => {
    if (dictateState === DictateState.STARTING || dictateState === DictateState.DICTATING) {
      stopDictate();
      setSendBox(dictateInterims.join(' '));
    } else {
      startDictate();
    }

    primeSpeechSynthesis(speechSynthesis, SpeechSynthesisUtterance);
  }, [
    dictateInterims,
    dictateState,
    primeSpeechSynthesis,
    setSendBox,
    speechSynthesis,
    SpeechSynthesisUtterance,
    startDictate,
    stopDictate
  ]);

  return useMemo(
    () => ({
      click,
      dictating: dictateState === DictateState.DICTATING,
      disabled: disabled || dictateState === DictateState.STARTING || dictateState === DictateState.STOPPING
    }),
    [click, dictateState, disabled]
  );
};

const MicrophoneButton = ({ className }) => {
  const { click, dictating, disabled } = useMicrophoneButton();
  const styleSet = useStyleSet();
  const buttonAltText = useLocalize('Speak');
  const microphoneStatusLabel = useLocalize(dictating ? 'Microphone on' : 'Microphone off');

  return (
    <div
      aria-controls="webchatSendBoxMicrophoneButton"
      className={classNames(styleSet.microphoneButton + '', ROOT_CSS + '', className + '', { dictating })}
    >
      <IconButton alt={buttonAltText} disabled={disabled} onClick={click}>
        <MicrophoneIcon />
      </IconButton>
      <div aria-live="polite" className="sr-only" id="webchatSendBoxMicrophoneButton" role="status">
        {microphoneStatusLabel}
      </div>
    </div>
  );
};

MicrophoneButton.defaultProps = {
  className: ''
};

MicrophoneButton.propTypes = {
  className: PropTypes.string
};

export default MicrophoneButton;

export { connectMicrophoneButton, useMicrophoneButton };
