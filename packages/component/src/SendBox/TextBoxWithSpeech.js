import { Composer } from 'react-dictate-button';
import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import MicrophoneIcon from './Assets/MicrophoneIcon';

const ROOT_CSS = css({
  display: 'flex',

  '& > .dictation, & > input': {
    flex: 1
  }
});

class TextBoxWithSpeech extends React.Component {
  constructor(props) {
    super(props);

    this.handleDictate = this.handleDictate.bind(this);
    this.handleDictateError = this.handleDictateError.bind(this);
    this.handleDictateProgress = this.handleDictateProgress.bind(this);
    this.handleMicrophoneClick = this.handleMicrophoneClick.bind(this);

    this.state = {
      dictating: false,
      interims: [],
      value: ''
    };
  }

  handleDictate({ result }) {
    this.setState(() => ({
      dictating: false,
      value: result.transcript
    }));
  }

  handleDictateError() {
  }

  handleDictateProgress({ results = [] }) {
    const interims = results.map(({ transcript }) => transcript);

    this.setState(() => ({ interims }));
  }

  handleMicrophoneClick() {
    this.setState(() => ({
      dictating: true
    }));
  }

  render() {
    const { props, state } = this;

    return (
      <Composer
        onDictate={ this.handleDictate }
        onError={ this.handleDictateError }
        onProgress={ this.handleDictateProgress }
        speechRecognition={ window.SpeechRecognition || window.webkitSpeechRecognition }
        speechGrammarList={ window.SpeechGrammarList || window.webkitSpeechGrammarList }
        started={ state.dictating && !props.disabled }
      >
        { context =>
          <div className={ classNames(ROOT_CSS + '', (props.className || '') + '') }>
            {
              state.dictating ?
                <div className="dictation">
                  { state.interims.map((interim, index) => <span key={ index }>{ interim }</span>) }
                </div>
              :
                <input
                  disabled={ props.disabled }
                  placeholder="type your message"
                  readOnly={ true }
                  type="textbox"
                  value={ state.value }
                />
            }
            <button
              disabled={ state.dictating || props.disabled }
              onClick={ this.handleMicrophoneClick }
            >
              <MicrophoneIcon />
            </button>
          </div>
        }
      </Composer>
    );
  }
}

TextBoxWithSpeech.propTypes = {
  disabled: PropTypes.bool
};

export default TextBoxWithSpeech
