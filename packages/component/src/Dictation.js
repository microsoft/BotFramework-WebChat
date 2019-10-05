import { Composer as DictateComposer } from 'react-dictate-button';
import { Constants } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from './connectToWebChat';

const {
  DictateState: { DICTATING, IDLE, STARTING }
} = Constants;

class Dictation extends React.Component {
  constructor(props) {
    super(props);

    this.handleDictate = this.handleDictate.bind(this);
    this.handleDictating = this.handleDictating.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  handleDictate({ result: { transcript } = {} }) {
    const {
      dictateState,
      setDictateInterims,
      setDictateState,
      setSendBox,
      startSpeakingActivity,
      stopDictate,
      submitSendBox
    } = this.props;

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
  }

  handleDictating({ results = [] }) {
    const { dictateState, postActivity, sendTypingIndicator, setDictateInterims, setDictateState } = this.props;

    if (dictateState === DICTATING || dictateState === STARTING) {
      const interims = results.map(({ transcript }) => transcript);

      setDictateInterims(interims);
      setDictateState(DICTATING);
      sendTypingIndicator && postActivity({ type: 'typing' });
    }
  }

  handleError(event) {
    const { dictateState, onError, setDictateState, stopDictate } = this.props;

    if (dictateState === DICTATING || dictateState === STARTING) {
      setDictateState(IDLE);
      stopDictate();

      onError && onError(event);
    }
  }

  render() {
    const {
      props: {
        dictateState,
        disabled,
        language,
        numSpeakingActivities,
        webSpeechPonyfill: { SpeechGrammarList, SpeechRecognition } = {}
      },
      handleDictate,
      handleDictating,
      handleError
    } = this;

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
  }
}

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
