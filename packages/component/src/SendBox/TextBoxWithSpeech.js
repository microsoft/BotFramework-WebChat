import { Composer } from 'react-dictate-button';
import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { withStyleSet } from '../Context';

import MicrophoneIcon from './Assets/MicrophoneIcon';

const ROOT_CSS = css({
  display: 'flex'
});

const IDLE = 0;
const STARTING = 1;
const DICTATING = 2;
const STOPPING = 3;

class TextBoxWithSpeech extends React.Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
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

  handleChange({ target: { value } }) {
    this.setState(() => ({
      value
    }));
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
          <div className={ classNames(ROOT_CSS + '', props.styleSet.sendBox + '', (props.className || '') + '') }>
            {
              state.readyState === IDLE ?
                <input
                  disabled={ props.disabled }
                  onChange={ this.handleChange }
                  placeholder="Type your message"
                  type="textbox"
                  value={ state.value }
                />
              :
                state.readyState === STARTING ?
                  <div className="status">Starting...</div>
                :
                  state.interims.length ?
                    <p className="dictation">
                      {
                        state.interims.map((interim, index) => <span key={ index }>{ interim }</span>)
                      }
                    </p>
                  :
                    <div className="status">Listening...</div>
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

export default withStyleSet(TextBoxWithSpeech)
