import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { Context as TypeFocusSinkContext } from '../Utils/TypeFocusSink';
import { localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';

const ROOT_CSS = css({
  display: 'flex',

  '& > input': {
    flex: 1
  }
});

const connectSendTextBox = (...selectors) => connectToWebChat(
  ({
    disabled,
    language,
    scrollToBottom,
    sendBoxValue,
    setSendBox,
    submitSendBox
  }) => ({
    disabled,
    language,
    onChange: ({ target: { value } }) => {
      scrollToBottom();
      setSendBox(value, 'keyboard');
    },
    onSubmit: event => {
      event.preventDefault();

      // Consider clearing the send box only after we received POST_ACTIVITY_PENDING
      // E.g. if the connection is bad, sending the message essentially do nothing but just clearing the send box

      if (sendBoxValue) {
        scrollToBottom();
        submitSendBox('keyboard');
      }
    },
    value: sendBoxValue
  }),
  ...selectors
)

export default connectSendTextBox(
  ({ styleSet }) => ({ styleSet })
)(({
  className,
  disabled,
  language,
  onChange,
  onSubmit,
  styleSet,
  value
}) =>
  <form
    className={ classNames(
      ROOT_CSS + '',
      styleSet.sendBoxTextBox + '',
      (className || '') + '',
    ) }
    onSubmit={ onSubmit }
  >
    {
      <TypeFocusSinkContext.Consumer>
        { ({ sendFocusRef }) =>
          <input
            disabled={ disabled }
            onChange={ onChange }
            placeholder={ localize('Type your message', language) }
            ref={ sendFocusRef }
            type="text"
            value={ value }
          />
        }
      </TypeFocusSinkContext.Consumer>
    }
  </form>
)

export { connectSendTextBox }
