import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { Context as TypeFocusSinkContext } from '../Utils/TypeFocusSink';
import { withStyleSet } from '../Context';
import IconButton from './IconButton';
import MicrophoneButton from './MicrophoneButton';
import Context from '../Context';
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
    this.handleSubmit = this.handleSubmit.bind(this);

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

  handleSubmit(event) {
    const { props } = this;

    event.preventDefault();

    if (props.sendBoxValue) {
      props.scrollToBottom();

      props.postActivity({
        text: props.sendBoxValue,
        type: 'message'
      });

      props.onSendBoxChange('');
    }
  }

  render() {
    const { props, state } = this;

    return (
      <form
        className={ classNames(
          ROOT_CSS + '',
          props.styleSet.sendBoxTextBox + '',
          (props.className || '') + '',
        ) }
        onSubmit={ this.handleSubmit }
      >
        {
          state.dictateState === IDLE ?
            <TypeFocusSinkContext.Consumer>
              { ({ sendFocusRef }) =>
                <input
                  disabled={ props.disabled }
                  onChange={ ({ target: { value } }) => props.onSendBoxChange(value) }
                  placeholder="Type your message"
                  ref={ sendFocusRef }
                  type="text"
                  value={ props.sendBoxValue }
                />
              }
            </TypeFocusSinkContext.Consumer>
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
                props.onSendBoxChange(transcript);
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
      </form>
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

export default ({
  className,
  disabled,
  speech
}) =>
  <Context.Consumer>
    {
      ({
        onSendBoxChange,
        postActivity,
        scrollToBottom,
        sendBoxValue,
        styleSet
      }) =>
        <TextBoxWithSpeech
          className={ className }
          disabled={ disabled }
          onSendBoxChange={ onSendBoxChange }
          postActivity={ postActivity }
          scrollToBottom={ scrollToBottom }
          sendBoxValue={ sendBoxValue }
          speech={ speech }
          styleSet={ styleSet }
        />
    }
  </Context.Consumer>
