// This is required for aria-controls.
/* eslint react/forbid-dom-props: "off" */

import { Constants } from 'botframework-webchat-core';
import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React, { FC, useCallback, useState } from 'react';

import connectToWebChat from '../connectToWebChat';
import IconButton from './IconButton';
import MicrophoneIcon from './Assets/MicrophoneIcon';
import useDictateAbortable from '../hooks/useDictateAbortable';
import useStyleSet from '../hooks/useStyleSet';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';
import useWebSpeechPonyfill from '../hooks/useWebSpeechPonyfill';

const { DictateState } = Constants;

const {
  useDictateInterims,
  useDictateState,
  useDisabled,
  useLocalizer,
  useSendBoxValue,
  useShouldSpeakIncomingActivity,
  useStartDictate,
  useStopDictate
} = hooks;

const ROOT_STYLE = {
  display: 'flex',

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
};

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
      webSpeechPonyfill
    }) => {
      const { speechSynthesis, SpeechSynthesisUtterance } = webSpeechPonyfill || {};

      return {
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
      };
    },
    ...selectors
  );
};

function useMicrophoneButtonClick(): () => void {
  const [, setSendBox] = useSendBoxValue();
  const [, setShouldSpeakIncomingActivity] = useShouldSpeakIncomingActivity();
  const [dictateInterims] = useDictateInterims();
  const [dictateState] = useDictateState();
  const [webSpeechPonyfill] = useWebSpeechPonyfill();
  const startDictate = useStartDictate();
  const stopDictate = useStopDictate();

  const { speechSynthesis, SpeechSynthesisUtterance } = webSpeechPonyfill || {};

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
}

function useMicrophoneButtonDisabled(): [boolean] {
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

type MicrophoneButtonProps = {
  className?: string;
};

const MicrophoneButton: FC<MicrophoneButtonProps> = ({ className }) => {
  const [{ microphoneButton: microphoneButtonStyleSet }] = useStyleSet();
  const [dictateState] = useDictateState();
  const [disabled] = useMicrophoneButtonDisabled();
  const click = useMicrophoneButtonClick();
  const localize = useLocalizer();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  const dictating = dictateState === DictateState.DICTATING;

  return (
    <div
      aria-controls="webchatSendBoxMicrophoneButton"
      className={classNames(
        'webchat__microphone-button',
        { 'webchat__microphone-button--dictating': dictating },
        microphoneButtonStyleSet + '',
        rootClassName,
        (className || '') + ''
      )}
    >
      <IconButton
        alt={localize('TEXT_INPUT_SPEAK_BUTTON_ALT')}
        className="webchat__microphone-button__button"
        disabled={disabled}
        onClick={click}
      >
        <MicrophoneIcon className="webchat__microphone-button__icon" />
      </IconButton>
      <div aria-live="polite" className="sr-only" id="webchatSendBoxMicrophoneButton" role="status">
        {localize(dictating ? 'SPEECH_INPUT_MICROPHONE_BUTTON_OPEN_ALT' : 'SPEECH_INPUT_MICROPHONE_BUTTON_CLOSE_ALT')}
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
