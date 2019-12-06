// This is required for aria-controls.
/* eslint react/forbid-dom-props: "off" */

import { Constants } from 'botframework-webchat-core';
import { css } from 'glamor';
import classNames from 'classnames';
import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

import connectToWebChat from '../connectToWebChat';
import IconButton from './IconButton';
import MicrophoneIcon from './Assets/MicrophoneIcon';
import useDictateAbortable from '../hooks/useDictateAbortable';
import useDictateInterims from '../hooks/useDictateInterims';
import useDictateState from '../hooks/useDictateState';
import useDisabled from '../hooks/useDisabled';
import useLocalize from '../hooks/useLocalize';
import useSendBoxValue from '../hooks/useSendBoxValue';
import useShouldSpeakIncomingActivity from '../hooks/useShouldSpeakIncomingActivity';
import useStartDictate from '../hooks/useStartDictate';
import useStopDictate from '../hooks/useStopDictate';
import useStyleSet from '../hooks/useStyleSet';
import useWebSpeechPonyfill from '../hooks/useWebSpeechPonyfill';

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

const useMicrophoneButtonClick = () => {
  const [, setSendBox] = useSendBoxValue();
  const [, setShouldSpeakIncomingActivity] = useShouldSpeakIncomingActivity();
  const [{ speechSynthesis, SpeechSynthesisUtterance } = {}] = useWebSpeechPonyfill();
  const [dictateInterims] = useDictateInterims();
  const [dictateState] = useDictateState();
  const startDictate = useStartDictate();
  const stopDictate = useStopDictate();

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
  return useCallback(() => {
    if (dictateState === DictateState.WILL_START) {
      setShouldSpeakIncomingActivity(false);
    } else if (dictateState === DictateState.DICTATING) {
      stopDictate();
      setSendBox(dictateInterims.join(' '));
    } else {
      setShouldSpeakIncomingActivity(false);
      startDictate();
    }

    primeSpeechSynthesis(speechSynthesis, SpeechSynthesisUtterance);
  }, [
    dictateInterims,
    dictateState,
    primeSpeechSynthesis,
    setSendBox,
    setShouldSpeakIncomingActivity,
    speechSynthesis,
    SpeechSynthesisUtterance,
    startDictate,
    stopDictate
  ]);
};

function useMicrophoneButtonDisabled() {
  const [abortable] = useDictateAbortable();
  const [dictateState] = useDictateState();
  const [disabled] = useDisabled();

  return [
    disabled ||
      dictateState === DictateState.STARTING ||
      dictateState === DictateState.STOPPING ||
      (dictateState === DictateState.DICTATING && !abortable)
  ];
}

const MicrophoneButton = ({ className }) => {
  const [{ microphoneButton: microphoneButtonStyleSet }] = useStyleSet();
  const [disabled] = useMicrophoneButtonDisabled();
  const click = useMicrophoneButtonClick();
  const [dictateState] = useDictateState();

  const dictating = dictateState === DictateState.DICTATING;

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
  className: ''
};

MicrophoneButton.propTypes = {
  className: PropTypes.string
};

export default MicrophoneButton;

export { connectMicrophoneButton, useMicrophoneButtonClick, useMicrophoneButtonDisabled };
