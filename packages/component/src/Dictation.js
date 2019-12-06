import { Composer as DictateComposer } from 'react-dictate-button';
import { Constants } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';

import useActivities from './hooks/useActivities';
import useDictateInterims from './hooks/useDictateInterims';
import useDictateState from './hooks/useDictateState';
import useDisabled from './hooks/useDisabled';
import useEmitTypingIndicator from './hooks/useEmitTypingIndicator';
import useLanguage from './hooks/useLanguage';
import useSendBoxValue from './hooks/useSendBoxValue';
import useSendTypingIndicator from './hooks/useSendTypingIndicator';
import useSetDictateState from './hooks/internal/useSetDictateState';
import useSettableDictateAbortable from './hooks/internal/useSettableDictateAbortable';
import useShouldSpeakIncomingActivity from './hooks/useShouldSpeakIncomingActivity';
import useStopDictate from './hooks/useStopDictate';
import useSubmitSendBox from './hooks/useSubmitSendBox';
import useWebSpeechPonyfill from './hooks/useWebSpeechPonyfill';

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
  const [language] = useLanguage();
  const [sendTypingIndicator] = useSendTypingIndicator();
  const emitTypingIndicator = useEmitTypingIndicator();
  const setDictateState = useSetDictateState();
  const stopDictate = useStopDictate();
  const submitSendBox = useSubmitSendBox();

  const numSpeakingActivities = useMemo(() => activities.filter(({ channelData: { speak } = {} }) => speak).length, [
    activities
  ]);

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
