import { Composer as DictateComposer } from 'react-dictate-button';
import { Constants } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import useActivities from './hooks/useActivities';
import useDictateInterims from './hooks/useDictateInterims';
import useDictateState from './hooks/useDictateState';
import useDisabled from './hooks/useDisabled';
import useLanguage from './hooks/useLanguage';
import usePostActivity from './hooks/usePostActivity';
import useSendBoxValue from './hooks/useSendBoxValue';
import useSendTypingIndicator from './hooks/useSendTypingIndicator';
import useSetDictateState from './hooks/internal/useSetDictateState';
import useStartSpeakingActivity from './hooks/useStartSpeakingActivity';
import useStopDictate from './hooks/useStopDictate';
import useSubmitSendBox from './hooks/useSubmitSendBox';
import useWebSpeechPonyfill from './hooks/useWebSpeechPonyfill';

const {
  DictateState: { DICTATING, IDLE, STARTING }
} = Constants;

const Dictation = ({ onError }) => {
  const [, setDictateInterims] = useDictateInterims();
  const [, setSendBox] = useSendBoxValue();
  const [{ SpeechGrammarList, SpeechRecognition } = {}] = useWebSpeechPonyfill();
  const [activities] = useActivities();
  const [dictateState] = useDictateState();
  const [disabled] = useDisabled();
  const [language] = useLanguage();
  const [sendTypingIndicator] = useSendTypingIndicator();
  const postActivity = usePostActivity();
  const setDictateState = useSetDictateState();
  const startSpeakingActivity = useStartSpeakingActivity();
  const stopDictate = useStopDictate();
  const submitSendBox = useSubmitSendBox();

  const numSpeakingActivities = activities.filter(({ channelData: { speak } = {} }) => speak).length;

  const handleDictate = useCallback(
    ({ result: { transcript } = {} }) => {
      if (dictateState === DICTATING || dictateState === STARTING) {
        setDictateInterims([]);
        setDictateState(IDLE);
        stopDictate();

        if (transcript) {
          setSendBox(transcript);
          submitSendBox('speech');
          startSpeakingActivity();
        }
      }
    },
    [dictateState, setDictateInterims, setDictateState, stopDictate, setSendBox, submitSendBox, startSpeakingActivity]
  );

  const handleDictating = useCallback(
    ({ results = [] }) => {
      if (dictateState === DICTATING || dictateState === STARTING) {
        const interims = results.map(({ transcript }) => transcript);

        setDictateInterims(interims);
        setDictateState(DICTATING);
        sendTypingIndicator && postActivity({ type: 'typing' });
      }
    },
    [dictateState, postActivity, sendTypingIndicator, setDictateInterims, setDictateState]
  );

  const handleError = useCallback(() => {
    dictateState !== IDLE && setDictateState(IDLE);
    (dictateState === DICTATING || dictateState === STARTING) && stopDictate();

    onError && onError(event);
  }, [dictateState, onError, setDictateState, stopDictate]);

  return (
    <DictateComposer
      lang={language}
      onDictate={handleDictate}
      onError={handleError}
      onProgress={handleDictating}
      speechGrammarList={SpeechGrammarList}
      speechRecognition={SpeechRecognition}
      started={!disabled && (dictateState === STARTING || dictateState === DICTATING) && !numSpeakingActivities}
    />
  );
};

Dictation.defaultProps = {
  onError: undefined
};

Dictation.propTypes = {
  onError: PropTypes.func
};

export default Dictation;
