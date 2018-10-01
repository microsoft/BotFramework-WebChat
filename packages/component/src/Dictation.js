import { Composer as DictateComposer } from 'react-dictate-button';
import React from 'react';

import connectWithContext from './connectWithContext';
import { Constants } from 'botframework-webchat-core';

const { DictateState } = Constants;

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
    props.setDictateState(DictateState.IDLE);

    props.stopSpeechInput();

    if (transcript) {
      props.setSendBox(transcript, 'speech');
      props.submitSendBox('speech');
      props.startSpeakingActivity();
    }
  }

  handleDictating({ results = [] }) {
    const { props } = this;
    const interims = results.map(({ transcript }) => transcript);

    props.setDictateInterims(interims);
    props.setDictateState(DictateState.DICTATING);

    // This is for two purposes:
    // 1. Set send box will also trigger send typing
    // 2. If the user cancelled out, the interim result will be in the send box so the user can update it before send
    props.setSendBox(interims.join(' '), 'speech');
  }

  handleError(event) {
    const { props } = this;

    props.setDictateState(DictateState.IDLE);
    props.stopSpeechInput();

    props.onError && props.onError(event);
  }

  render() {
    const {
      props: { dictateState, disabled, enableSpeech, webSpeechPonyfill }
    } = this;

    return (
      <DictateComposer
        onDictate={ this.handleDictate }
        onError={ this.handleError }
        onProgress={ this.handleDictating }
        speechRecognition={ webSpeechPonyfill && webSpeechPonyfill.SpeechRecognition }
        speechGrammarList={ webSpeechPonyfill && webSpeechPonyfill.SpeechGrammarList }
        started={
          !disabled
          && enableSpeech
          && (dictateState === DictateState.STARTING || dictateState === DictateState.DICTATING)
        }
      />
    );
  }
}

export default connectWithContext(
  ({ input: { dictateState } }) => ({ dictateState }),
  ({
    disabled,
    enableSpeech,
    setDictateInterims,
    setDictateState,
    setSendBox,
    startSpeakingActivity,
    stopSpeechInput,
    submitSendBox,
    webSpeechPonyfill
  }) => ({
    disabled,
    enableSpeech,
    setDictateInterims,
    setDictateState,
    setSendBox,
    startSpeakingActivity,
    stopSpeechInput,
    submitSendBox,
    webSpeechPonyfill
  })
)(Dictation)
