import { hooks } from 'botframework-webchat-api';
// TODO: [P1] #3350 No import from internal, we need to move setDictateState from bf-wc-core (Redux) to React Context.
import { useSetDictateState } from 'botframework-webchat-api/internal';
import { Constants } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { Composer as DictateComposer } from 'react-dictate-button';

import useResumeAudioContext from './hooks/internal/useResumeAudioContext';
import useSettableDictateAbortable from './hooks/internal/useSettableDictateAbortable';
import useWebSpeechPonyfill from './hooks/useWebSpeechPonyfill';

const {
  useDictateInterims,
  useDictateState,
  useEmitTypingIndicator,
  useLanguage,
  useSendBoxValue,
  useSendTypingIndicator,
  useShouldSpeakIncomingActivity,
  useStopDictate,
  useStyleOptions,
  useSubmitSendBox,
  useUIState
} = hooks;

const {
  DictateState: { DICTATING, IDLE, STARTING }
} = Constants;

const Dictation = ({ onError }) => {
  const [, setDictateAbortable] = useSettableDictateAbortable();
  const [, setDictateInterims] = useDictateInterims();
  const [, setSendBox] = useSendBoxValue();
  const [, setShouldSpeakIncomingActivity] = useShouldSpeakIncomingActivity();
  const [{ SpeechGrammarList, SpeechRecognition } = {}] = useWebSpeechPonyfill();
  const [{ speechRecognitionContinuous }] = useStyleOptions();
  const [dictateState] = useDictateState();
  const [sendTypingIndicator] = useSendTypingIndicator();
  const [speechLanguage] = useLanguage('speech');
  const [uiState] = useUIState();
  const emitTypingIndicator = useEmitTypingIndicator();
  const resumeAudioContext = useResumeAudioContext();
  const setDictateState = useSetDictateState();
  const stopDictate = useStopDictate();
  const submitSendBox = useSubmitSendBox();

  const handleDictate = useCallback(
    ({ result: { confidence, transcript } = {} }) => {
      if (dictateState === DICTATING || dictateState === STARTING) {
        setDictateInterims([]);

        if (transcript) {
          setSendBox(transcript);
          submitSendBox('speech', { channelData: { speech: { alternatives: [{ confidence, transcript }] } } });
          setShouldSpeakIncomingActivity(true);
        }
      }
    },
    [dictateState, setDictateInterims, setSendBox, submitSendBox, setShouldSpeakIncomingActivity]
  );

  const handleDictating = useCallback(
    ({ abortable, results = [] }) => {
      if (dictateState === DICTATING || dictateState === STARTING) {
        const interims = results.map(({ transcript }) => transcript);

        setDictateAbortable(abortable);
        setDictateInterims(interims);
        setDictateState(DICTATING);
        sendTypingIndicator && emitTypingIndicator();
      }
    },
    [dictateState, emitTypingIndicator, sendTypingIndicator, setDictateAbortable, setDictateInterims, setDictateState]
  );

  const handleEnd = useCallback(() => {
    dictateState !== IDLE && setDictateState(IDLE);
    (dictateState === DICTATING || dictateState === STARTING) && stopDictate();
  }, [dictateState, setDictateState, stopDictate]);

  const handleError = useCallback(
    event => {
      dictateState !== IDLE && setDictateState(IDLE);
      (dictateState === DICTATING || dictateState === STARTING) && stopDictate();

      onError && onError(event);
    },
    [dictateState, onError, setDictateState, stopDictate]
  );

  useEffect(() => {
    window.addEventListener('pointerdown', resumeAudioContext);

    return () => window.removeEventListener('pointerdown', resumeAudioContext);
  }, [resumeAudioContext]);

  return (
    <DictateComposer
      continuous={speechRecognitionContinuous}
      lang={speechLanguage}
      onDictate={handleDictate}
      onEnd={handleEnd}
      onError={handleError}
      onProgress={handleDictating}
      speechGrammarList={SpeechGrammarList}
      speechRecognition={SpeechRecognition}
      started={uiState !== 'disabled' && (dictateState === STARTING || dictateState === DICTATING)}
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
