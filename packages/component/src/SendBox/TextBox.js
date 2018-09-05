import { connect } from 'react-redux';
import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { Context as TypeFocusSinkContext } from '../Utils/TypeFocusSink';
import Context from '../Context';

const ROOT_CSS = css({
  display: 'flex',

  '& > input': {
    flex: 1
  }
});

class TextBoxWithSpeech extends React.Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange({ target: { value } }) {
    const { props } = this;

    props.scrollToBottom();
    props.setSendBox(value);

    value && props.sendTyping();
  }

  handleSubmit(event) {
    const { props } = this;
    const { sendBox } = props;

    event.preventDefault();

    // Consider clearing the send box only after we received POST_ACTIVITY_PENDING
    // E.g. if the connection is bad, sending the message essentially do nothing but just clearing the send box
    if (sendBox) {
      props.scrollToBottom();
      props.sendMessage(sendBox);
      props.setSendBox('');
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
          <TypeFocusSinkContext.Consumer>
            { ({ sendFocusRef }) =>
              <input
                disabled={ props.disabled }
                onChange={ this.handleChange }
                placeholder="Type your message"
                ref={ sendFocusRef }
                type="text"
                value={ props.sendBox }
              />
            }
          </TypeFocusSinkContext.Consumer>
        }
      </form>
    );
  }
}

TextBoxWithSpeech.defaultProps = {
  disabled: false
};

TextBoxWithSpeech.propTypes = {
  disabled: PropTypes.bool
};

export default connect(({ input: { sendBox, speechState } }) => ({ sendBox, speechState }))(props =>
  <Context.Consumer>
    {
      ({
        scrollToBottom,
        sendMessage,
        sendTyping,
        setSendBox,
        stopSpeakingActivity,
        styleSet
      }) =>
        <TextBoxWithSpeech
          { ...props }
          scrollToBottom={ scrollToBottom }
          sendMessage={ sendMessage }
          sendTyping={ sendTyping }
          setSendBox={ setSendBox }
          stopSpeakingActivity={ stopSpeakingActivity }
          styleSet={ styleSet }
        />
    }
  </Context.Consumer>
)
