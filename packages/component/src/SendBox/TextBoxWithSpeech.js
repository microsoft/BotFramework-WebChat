import { Composer } from 'react-dictate-button';
import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import MicrophoneIcon from './Assets/MicrophoneIcon';

const ROOT_CSS = css({
  display: 'flex',

  '& > .dictation, & > .status, & > input': {
    flex: 1
  },

  '& > .dictation > span:last-child': {
    opacity: .5
  }
});

const IDLE = 0;
const STARTING = 1;
const DICTATING = 2;
const STOPPING = 3;

class TextBoxWithSpeech extends React.Component {
  constructor(props) {
    super(props);

    this.handleDictate = this.handleDictate.bind(this);
    this.handleDictateError = this.handleDictateError.bind(this);
    this.handleDictateProgress = this.handleDictateProgress.bind(this);
    this.handleMicrophoneClick = this.handleMicrophoneClick.bind(this);

    this.state = {
      readyState: IDLE,
      interims: [],
      value: ''
    };
  }

  handleDictate({ result }) {
    this.setState(({ value }) => ({
      readyState: IDLE,
      value: result ? result.transcript : value
    }));
  }

  handleDictateError() {
    this.setState(() => ({
      interims: [],
      readyState: IDLE
    }));
  }

  handleDictateProgress({ results = [] }) {
    const interims = results.map(({ transcript }) => transcript);

    this.setState(() => ({
      interims,
      readyState: DICTATING
    }));
  }

  handleMicrophoneClick() {
    this.setState(({ readyState }) => ({ readyState: readyState === DICTATING ? STOPPING : STARTING }));
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
        started={ !props.disabled && (state.readyState === STARTING || state.readyState === DICTATING) }
      >
        { context =>
          <div className={ classNames(ROOT_CSS + '', (props.className || '') + '') }>
            {
              state.readyState === IDLE ?
                <input
                  disabled={ props.disabled }
                  placeholder="Type your message"
                  readOnly={ true }
                  type="textbox"
                  value={ state.value }
                />
              :
                state.readyState === STARTING ?
                  <span className="status">Starting...</span>
                :
                  state.interims.length ?
                    <p className="dictation">
                      {
                        state.interims.map((interim, index) => <span key={ index }>{ interim }</span>)
                      }
                    </p>
                  :
                    <span className="status">Listening...</span>
            }
            <button
              disabled={ props.disabled && (readyState === STARTING || readyState === STOPPING) }
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
