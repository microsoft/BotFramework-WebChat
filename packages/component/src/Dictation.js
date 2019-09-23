import { Composer as DictateComposer } from 'react-dictate-button';
import { Constants } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import connectToWebChat from './connectToWebChat';

const {
  DictateState: { DICTATING, IDLE, STARTING }
} = Constants;

const Dictation = ({
  dictateState,
  disabled,
  emitTypingIndicator,
  language,
  numSpeakingActivities,
  onError,
  postActivity,
  sendTypingIndicator,
  setDictateInterims,
  setDictateState,
  setSendBox,
  startSpeakingActivity,
  stopDictate,
  submitSendBox,
  webSpeechPonyfill: { SpeechGrammarList, SpeechRecognition } = {}
}) => {
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
        sendTypingIndicator && emitTypingIndicator();
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
  disabled: false,
  onError: undefined,
  webSpeechPonyfill: undefined
};

Dictation.propTypes = {
  dictateState: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  language: PropTypes.string.isRequired,
  numSpeakingActivities: PropTypes.number.isRequired,
  onError: PropTypes.func,
  postActivity: PropTypes.func.isRequired,
  sendTypingIndicator: PropTypes.bool.isRequired,
  setDictateInterims: PropTypes.func.isRequired,
  setDictateState: PropTypes.func.isRequired,
  setSendBox: PropTypes.func.isRequired,
  startSpeakingActivity: PropTypes.func.isRequired,
  stopDictate: PropTypes.func.isRequired,
  submitSendBox: PropTypes.func.isRequired,
  webSpeechPonyfill: PropTypes.shape({
    SpeechGrammarList: PropTypes.any.isRequired,
    SpeechRecognition: PropTypes.any.isRequired
  })
};

export default connectToWebChat(
  ({
    activities,
    dictateState,
    disabled,
    emitTypingIndicator,
    language,
    postActivity,
    sendTypingIndicator,
    setDictateInterims,
    setDictateState,
    setSendBox,
    startSpeakingActivity,
    stopDictate,
    submitSendBox,
    webSpeechPonyfill
  }) => ({
    dictateState,
    disabled,
    emitTypingIndicator,
    language,
    numSpeakingActivities: activities.filter(({ channelData: { speak } = {} }) => speak).length,
    postActivity,
    sendTypingIndicator,
    setDictateInterims,
    setDictateState,
    setSendBox,
    startSpeakingActivity,
    stopDictate,
    submitSendBox,
    webSpeechPonyfill
  })
)(Dictation);
