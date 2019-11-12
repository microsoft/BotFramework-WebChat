import { Composer as DictateComposer } from 'react-dictate-button';
import { Constants } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';

import connectToWebChat from './connectToWebChat';

import useActivities from './hooks/useActivities';
import useLanguage from './hooks/useLanguage';

const {
  DictateState: { DICTATING, IDLE, STARTING }
} = Constants;

const Dictation = ({
  dictateState,
  disabled,
  emitTypingIndicator,
  onError,
  sendTypingIndicator,
  setDictateInterims,
  setDictateState,
  setSendBox,
  startSpeakingActivity,
  stopDictate,
  submitSendBox,
  webSpeechPonyfill: { SpeechGrammarList, SpeechRecognition } = {}
}) => {
  const [activities] = useActivities();
  const [language] = useLanguage();

  const numSpeakingActivities = useMemo(() => activities.filter(({ channelData: { speak } = {} }) => speak).length, [
    activities
  ]);

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
    [dictateState, emitTypingIndicator, sendTypingIndicator, setDictateInterims, setDictateState]
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
  emitTypingIndicator: PropTypes.func.isRequired,
  onError: PropTypes.func,
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
    dictateState,
    disabled,
    emitTypingIndicator,
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
