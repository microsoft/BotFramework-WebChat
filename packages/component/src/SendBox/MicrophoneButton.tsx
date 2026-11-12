// This is required for aria-controls.
/* eslint react/forbid-dom-props: "off" */

import { hooks } from 'botframework-webchat-api';
import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import { Constants } from 'botframework-webchat-core';
import cx from 'classnames';
import memoize from 'memoize-one';
import React, { memo, useCallback, useState } from 'react';

import useDictateAbortable from '../hooks/useDictateAbortable';
import useWebSpeechPonyfill from '../hooks/useWebSpeechPonyfill';
import { useLiveRegion } from '../providers/LiveRegionTwin';
import { ComponentIcon } from '../Icon';
import IconButton from './IconButton';
import styles from './SendBox.module.css';
import testIds from '../testIds';

const { DictateState } = Constants;

const {
  useDictateInterims,
  useDictateState,
  useLocalizer,
  useSendBoxValue,
  useShouldSpeakIncomingActivity,
  useStartDictate,
  useStopDictate,
  useUIState
} = hooks;

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
  const [uiState] = useUIState();

  return [
    uiState === 'disabled' ||
      dictateState === DictateState.STARTING ||
      dictateState === DictateState.STOPPING ||
      (dictateState === DictateState.DICTATING && !abortable)
  ];
}

type MicrophoneButtonProps = Readonly<{
  className?: string | undefined;
}>;

const MicrophoneButton = ({ className }: MicrophoneButtonProps) => {
  const classNames = useStyles(styles, webChatPrefixedClassName);
  const [dictateState] = useDictateState();
  const [disabled] = useMicrophoneButtonDisabled();
  const click = useMicrophoneButtonClick();
  const localize = useLocalizer();

  const dictating = dictateState === DictateState.DICTATING;

  const message = localize(
    dictating ? 'SPEECH_INPUT_MICROPHONE_BUTTON_OPEN_ALT' : 'SPEECH_INPUT_MICROPHONE_BUTTON_CLOSE_ALT'
  );

  useLiveRegion(() => message && <div className="webchat__microphone-button__status">{message}</div>, [message]);

  return (
    <div
      aria-controls="webchatSendBoxMicrophoneButton"
      className={cx(
        classNames['microphone-button'],
        { [classNames['microphone-button--dictating']]: dictating },
        className
      )}
    >
      <IconButton
        alt={localize('TEXT_INPUT_SPEAK_BUTTON_ALT')}
        className={classNames['microphone-button__button']}
        data-testid={testIds.sendBoxMicrophoneButton}
        disabled={disabled}
        onClick={click}
      >
        <ComponentIcon
          appearance="text"
          className={cx('webchat__microphone-icon', classNames['microphone-button__icon'])}
          icon="microphone"
        />
      </IconButton>
      <div className="sr-only" id="webchatSendBoxMicrophoneButton">
        {message}
      </div>
    </div>
  );
};

MicrophoneButton.displayName = 'MicrophoneButton';

export default memo(MicrophoneButton);

export { useMicrophoneButtonClick, useMicrophoneButtonDisabled };
