import { Composer as DictateComposer } from 'react-dictate-button';
import { Constants } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import useWebChat from './useWebChat';

const {
  DictateState: { DICTATING, IDLE, STARTING }
} = Constants;

const Dictation = ({ onError }) => {
  const {
    activities,
    dictateState,
    disabled,
    language,
    postActivity,
    sendTypingIndicator,
    setDictateInterims,
    setDictateState,
    setSendBox,
    SpeechGrammarList,
    SpeechRecognition,
    startSpeakingActivity,
    stopDictate,
    submitSendBox
  } = useWebChat(
    ({
      activities,
      dictateState,
      disabled,
      language,
      postActivity,
      sendTypingIndicator,
      setDictateInterims,
      setDictateState,
      setSendBox,
      startSpeakingActivity,
      stopDictate,
      submitSendBox,
      webSpeechPonyfill: { SpeechGrammarList, SpeechRecognition } = {}
    }) => ({
      activities,
      dictateState,
      disabled,
      language,
      postActivity,
      sendTypingIndicator,
      setDictateInterims,
      setDictateState,
      setSendBox,
      SpeechGrammarList,
      SpeechRecognition,
      startSpeakingActivity,
      stopDictate,
      submitSendBox
    })
  );

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
