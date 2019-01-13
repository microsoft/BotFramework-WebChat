import { Composer as DictateComposer } from 'react-dictate-button';
import React from 'react';

import { Constants } from 'botframework-webchat-core';
import connectToWebChat from './connectToWebChat';

const {
  DictateState: {
    DICTATING,
    IDLE,
    STARTING
  }
} = Constants;

class Dictation extends React.Component {
  constructor(props) {
    super(props);

    this.handleDictate = this.handleDictate.bind(this);
    this.handleDictating = this.handleDictating.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  handleDictate({ result: { transcript } = {} }) {
    const { props } = this;

    props.setDictateInterims([]);
    props.setDictateState(IDLE);
    props.stopDictate();

    if (transcript) {
      props.setSendBox(transcript);
      props.submitSendBox('speech');
      props.startSpeakingActivity();
    }
  }

  handleDictating({ results = [] }) {
    const { props } = this;
    const interims = results.map(({ transcript }) => transcript);

    props.setDictateInterims(interims);
    props.setDictateState(DICTATING);

    // This is for two purposes:
    // 1. Set send box will also trigger send typing
    // 2. If the user cancelled out, the interim result will be in the send box so the user can update it before send
    props.setSendBox(interims.join(' '));
  }

  handleError(event) {
    const { props } = this;

    props.setDictateState(IDLE);
    props.stopDictate();

    props.onError && props.onError(event);
  }

  render() {
    const {
      props: {
        dictateState,
        disabled,
        language,
        webSpeechPonyfill
      },
      handleDictate,
      handleDictating,
      handleError
    } = this;

    const { SpeechGrammarList, SpeechRecognition } = webSpeechPonyfill || {};

    return (
      <DictateComposer
        lang={ language }
        onDictate={ handleDictate }
        onError={ handleError }
        onProgress={ handleDictating }
        speechRecognition={ SpeechRecognition }
        speechGrammarList={ SpeechGrammarList }
        started={ !disabled && (dictateState === STARTING || dictateState === DICTATING) }
      />
    );
  }
}

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
)(Dictation)
