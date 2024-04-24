import { Composer as DictateComposer } from 'react-dictate-button';
import { Constants } from 'botframework-webchat-core';
import { hooks } from 'botframework-webchat-api';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo } from 'react';

import useResumeAudioContext from './hooks/internal/useResumeAudioContext';
import useSettableDictateAbortable from './hooks/internal/useSettableDictateAbortable';
import useWebSpeechPonyfill from './hooks/useWebSpeechPonyfill';

// TODO: [P1] #3350 No /lib/, we need to move setDictateState from bf-wc-core (Redux) to React Context.
import useSetDictateState from 'botframework-webchat-api/lib/hooks/internal/useSetDictateState';

const {
  useActivities,
  useDictateInterims,
  useDictateState,
  useDisabled,
  useEmitTypingIndicator,
  useLanguage,
  useSendBoxValue,
  useSendTypingIndicator,
  useShouldSpeakIncomingActivity,
  useStopDictate,
  useSubmitSendBox
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
  const [activities] = useActivities();
  const [dictateState] = useDictateState();
  const [disabled] = useDisabled();
  const [sendTypingIndicator] = useSendTypingIndicator();
  const [speechLanguage] = useLanguage('speech');
  const emitTypingIndicator = useEmitTypingIndicator();
  const resumeAudioContext = useResumeAudioContext();
  const setDictateState = useSetDictateState();
  const stopDictate = useStopDictate();
  const submitSendBox = useSubmitSendBox();

  const numSpeakingActivities = useMemo(
    () => activities.filter(({ channelData: { speak } = {} }) => speak).length,
    [activities]
  );

  const handleDictate = useCallback(
    ({ result: { confidence, transcript } = {} }) => {
      if (dictateState === DICTATING || dictateState === STARTING) {
        setDictateInterims([]);
        setDictateState(IDLE);
        stopDictate();

        if (transcript) {
          setSendBox(transcript);
          submitSendBox('speech', { channelData: { speech: { alternatives: [{ confidence, transcript }] } } });
          setShouldSpeakIncomingActivity(true);
        }
      }
    },
    [
      dictateState,
      setDictateInterims,
      setDictateState,
      stopDictate,
      setSendBox,
      submitSendBox,
      setShouldSpeakIncomingActivity
    ]
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
      lang={speechLanguage}
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
