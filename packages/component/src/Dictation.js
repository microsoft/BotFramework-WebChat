import { Composer as DictateComposer } from 'react-dictate-button';
import { Constants } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';

import connectToWebChat from './connectToWebChat';

import useActivities from './hooks/useActivities';
import useDisabled from './hooks/useDisabled';
import useLanguage from './hooks/useLanguage';
import useSendBoxValue from './hooks/useSendBoxValue';
import useSendTypingIndicator from './hooks/useSendTypingIndicator';
import useSubmitSendBox from './hooks/useSubmitSendBox';

const {
  DictateState: { DICTATING, IDLE, STARTING }
} = Constants;

const Dictation = ({
  dictateState,
  emitTypingIndicator,
  onError,
  setDictateInterims,
  setDictateState,
  startSpeakingActivity,
  stopDictate,
  webSpeechPonyfill: { SpeechGrammarList, SpeechRecognition } = {}
}) => {
  const [, setSendBox] = useSendBoxValue();
  const [activities] = useActivities();
  const [disabled] = useDisabled();
  const [language] = useLanguage();
  const [sendTypingIndicator] = useSendTypingIndicator();
  const submitSendBox = useSubmitSendBox();

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
  onError: undefined,
  webSpeechPonyfill: undefined
};

Dictation.propTypes = {
  dictateState: PropTypes.number.isRequired,
  emitTypingIndicator: PropTypes.func.isRequired,
  onError: PropTypes.func,
  setDictateInterims: PropTypes.func.isRequired,
  setDictateState: PropTypes.func.isRequired,
  startSpeakingActivity: PropTypes.func.isRequired,
  stopDictate: PropTypes.func.isRequired,
  webSpeechPonyfill: PropTypes.shape({
    SpeechGrammarList: PropTypes.any.isRequired,
    SpeechRecognition: PropTypes.any.isRequired
  })
};

export default connectToWebChat(
  ({
    dictateState,
    emitTypingIndicator,
    postActivity,
    setDictateInterims,
    setDictateState,
    startSpeakingActivity,
    stopDictate,
    webSpeechPonyfill
  }) => ({
    dictateState,
    emitTypingIndicator,
    postActivity,
    setDictateInterims,
    setDictateState,
    startSpeakingActivity,
    stopDictate,
    webSpeechPonyfill
  })
)(Dictation);
