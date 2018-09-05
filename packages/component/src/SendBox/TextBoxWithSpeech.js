import { connect } from 'react-redux';
import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

// TODO: Consider moving backend action to composer
import { Context as TypeFocusSinkContext } from '../Utils/TypeFocusSink';
import Context from '../Context';
import IconButton from './IconButton';
import MicrophoneButton from './MicrophoneButton';
import SendIcon from './Assets/SendIcon';

const ROOT_CSS = css({
  display: 'flex'
});

class TextBoxWithSpeech extends React.Component {
  constructor(props) {
    super(props);

    this.handleDictateError = this.handleDictateError.bind(this);
    this.handleDictating = this.handleDictating.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      interims: []
    };
  }

  handleDictateError() {
    this.setState(() => ({ interims: [] }));
  }

  handleDictating({ interims }) {
    this.props.scrollToBottom();
    this.setState(() => ({ interims }));
  }

  handleSubmit(event) {
    const { props } = this;
    const { sendBoxValue } = props;

    event.preventDefault();

    // Consider clearing the send box only after we received POST_ACTIVITY_PENDING
    // E.g. if the connection is bad, sending the message essentially do nothing but just clearing the send box
    if (sendBoxValue) {
      props.scrollToBottom();
      props.sendMessage(sendBoxValue);
      props.onSendBoxChange('');
      props.sendTyping(false);
      props.stopSpeakingActivity();
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
          !this.props.speechState ?
            <TypeFocusSinkContext.Consumer>
              { ({ sendFocusRef }) =>
                <input
                  disabled={ props.disabled }
                  onChange={ ({ target: { value } }) => {
                    props.onSendBoxChange(value);
                    value && props.sendTyping();
                  } }
                  placeholder="Type your message"
                  ref={ sendFocusRef }
                  type="text"
                  value={ props.sendBoxValue }
                />
              }
            </TypeFocusSinkContext.Consumer>
          : state.interims.length ?
            <p className="dictation">
              {
                state.interims.map((interim, index) => <span key={ index }>{ interim }</span>)
              }
            </p>
          :
            <div className="status">Listening&hellip;</div>
        }
        {
          props.speech ?
            <MicrophoneButton
              disabled={ props.disabled }
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

  // TODO: Rename to speechEnabled
  speech: PropTypes.bool
};

export default connect(({ input: { speechState } }) => ({ speechState }))(props =>
  <Context.Consumer>
    {
      ({
        onSendBoxChange,
        scrollToBottom,
        sendBoxValue,
        sendMessage,
        sendTyping,
        stopSpeakingActivity,
        styleSet
      }) =>
        <TextBoxWithSpeech
          { ...props }
          onSendBoxChange={ onSendBoxChange }
          scrollToBottom={ scrollToBottom }
          sendBoxValue={ sendBoxValue }
          sendMessage={ sendMessage }
          sendTyping={ sendTyping }
          stopSpeakingActivity={ stopSpeakingActivity }
          styleSet={ styleSet }
        />
    }
  </Context.Consumer>
)
