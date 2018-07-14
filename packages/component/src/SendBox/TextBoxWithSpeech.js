import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { withStyleSet } from '../Context';
import IconButton from './IconButton';
import MicrophoneButton from './MicrophoneButton';
import SendBoxContext from './Context';
import SendIcon from './Assets/SendIcon';

const ROOT_CSS = css({
  display: 'flex'
});

const IDLE = 0;
const STARTING = 1;
const DICTATING = 2;

class TextBoxWithSpeech extends React.Component {
  constructor(props) {
    super(props);

    this.handleDictateClick = this.handleDictateClick.bind(this);
    this.handleDictateError = this.handleDictateError.bind(this);
    this.handleDictating = this.handleDictating.bind(this);

    this.state = {
      interims: [],
      dictateState: IDLE
    };
  }

  handleDictateClick() {
    this.setState(() => ({
      dictateState: STARTING
    }));
  }

  handleDictateError() {
    this.setState(() => ({
      dictateState: IDLE,
      interims: []
    }));
  }

  handleDictating({ interims }) {
    this.setState(() => ({
      dictateState: DICTATING,
      interims
    }));
  }

  render() {
    const { props, state } = this;

    return (
      <SendBoxContext>
        { context =>
          <div
            className={ classNames(
              ROOT_CSS + '',
              props.styleSet.sendBox + '',
              (props.className || '') + '',
            ) }
          >
            {
              state.dictateState === IDLE ?
                <input
                  disabled={ props.disabled }
                  onChange={ ({ target: { value } }) => context.setValue(value) }
                  placeholder="Type your message"
                  type="textbox"
                  value={ context.value }
                />
              : state.dictateState === STARTING ?
                <div className="status">Starting...</div>
              : state.interims.length ?
                <p className="dictation">
                  {
                    state.interims.map((interim, index) => <span key={ index }>{ interim }</span>)
                  }
                </p>
              :
                <div className="status">Listening...</div>
            }
            {
              props.speech ?
                <MicrophoneButton
                  disabled={ props.disabled }
                  onClick={ this.handleDictateClick }
                  onDictate={ ({ transcript }) => {
                    context.setValue(transcript);
                    this.setState(() => ({ dictateState: IDLE }));
                  } }
                  onDictateClick={ this.handleDictateClick }
                  onDictating={ this.handleDictating }
                  onError={ this.handleDictateError }
                />
              :
                <IconButton>
                  <SendIcon />
                </IconButton>
            }
          </div>
        }
      </SendBoxContext>
    );
  }
}

TextBoxWithSpeech.defaultProps = {
  speech: true
};

TextBoxWithSpeech.propTypes = {
  disabled: PropTypes.bool,
  speech: PropTypes.bool
};

export default withStyleSet(TextBoxWithSpeech)
