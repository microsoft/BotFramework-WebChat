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
      setDictateInterims,
      setDictateState,
      setSendBox,
      startSpeakingActivity,
      stopDictate,
      submitSendBox
    } = this.props;

    setDictateInterims([]);
    setDictateState(IDLE);
    stopDictate();

    if (transcript) {
      setSendBox(transcript);
      submitSendBox('speech');
      startSpeakingActivity();
    }
  }

  handleDictating({ results = [] }) {
    const { setDictateInterims, setDictateState, setSendBox } = this.props;

    const interims = results.map(({ transcript }) => transcript);

    setDictateInterims(interims);
    setDictateState(DICTATING);

    // This is for two purposes:
    // 1. Set send box will also trigger send typing
    // 2. If the user cancelled out, the interim result will be in the send box so the user can update it before send
    setSendBox(interims.join(' '));
  }

  handleError(event) {
    const { onError, setDictateState, stopDictate } = this.props;

    setDictateState(IDLE);
    stopDictate();

    onError && onError(event);
  }

  render() {
    const {
      props: { dictateState, disabled, language, webSpeechPonyfill: { SpeechGrammarList, SpeechRecognition } = {} },
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
        started={!disabled && (dictateState === STARTING || dictateState === DICTATING)}
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
  onError: PropTypes.func,
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
    language,
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
    setDictateInterims,
    setDictateState,
    setSendBox,
    startSpeakingActivity,
    stopDictate,
    submitSendBox,
    webSpeechPonyfill
  })
)(Dictation);
