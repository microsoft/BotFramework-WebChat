import React from 'react';

function prefix(name) {
  try {
    if (window) {
      if (typeof window[name] !== 'undefined') {
        return window[name];
      } else {
        const prefixed = `webkit${ name }`;

        return window[prefixed];
      }
    }
  } catch (err) {}
}

const SpeechRecognition = prefix('SpeechRecognition');
const SpeechGrammarList = prefix('SpeechGrammarList');
const SpeechRecognitionEvent = prefix('SpeechRecognitionEvent');

export default class MicrophoneButton extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);

    this.state = {
      support: (SpeechRecognition && SpeechRecognitionEvent) ? 'probably' : false
    };
  }

  handleClick(event) {
    const { recognition = new SpeechRecognition() } = this;

    this.recognition.start();
  }

  render() {
    const { props, state } = this;

    return (
      <button
        className={ props.className }
        disabled={ state.support === false }
        onClick={ this.handleClick }
      >
        { props.children }
      </button>
    );
  }
}
