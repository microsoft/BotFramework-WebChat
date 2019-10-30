import { Composer as DictateComposer } from 'react-dictate-button';
import { Constants } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';

import connectToWebChat from './connectToWebChat';

const {
  DictateState: { DICTATING, IDLE, STARTING }
} = Constants;

const PrefixedAudioContext = window.AudioContext || window.webkitAudioContext;

// The result of this check is asynchronous and it will fail on user interaction requirement.
async function canOpenMicrophone() {
  const audioContext = new PrefixedAudioContext();

  try {
    if (audioContext.state === 'suspended') {
      return await Promise.race([
        audioContext.resume().then(() => true),
        new Promise(resolve => setImmediate(resolve)).then(() => false)
      ]);
    }

    return true;
  } finally {
    await audioContext.close();
  }
}

const Dictation = ({
  dictateState,
  disabled,
  emitTypingIndicator,
  language,
  numSpeakingActivities,
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

  const shouldStart = !disabled && (dictateState === STARTING || dictateState === DICTATING) && !numSpeakingActivities;

  // We need to check if the browser allow us to do open microphone.
  // In Safari, it block microphone access if the code was not executed based on user interaction.

  // Since the check call is asynchronous, the result will always fail the user interaction requirement.
  // Thus, we can never open microphone after we receive the check result.
  // Instead, we will both open microphone and check the result. If the result is negative, we will close the microphone.

  // TODO: [P3] Investigate if a resumed AudioContext instance is kept across multiple session, can we workaround Safari's restrictions.
  useMemo(async () => {
    if (shouldStart) {
      const canStart = await canOpenMicrophone();

      !canStart && stopDictate();
    }
  }, [shouldStart, stopDictate]);

  return (
    <DictateComposer
      lang={language}
      onDictate={handleDictate}
      onError={handleError}
      onProgress={handleDictating}
      speechGrammarList={SpeechGrammarList}
      speechRecognition={SpeechRecognition}
      started={shouldStart}
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
  language: PropTypes.string.isRequired,
  numSpeakingActivities: PropTypes.number.isRequired,
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
