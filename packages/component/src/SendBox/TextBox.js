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
    scrollToEnd,
    sendBoxValue,
    setSendBox,
    submitSendBox
  }) => ({
    disabled,
    language,
    onChange: ({ target: { value } }) => {
      setSendBox(value);
    },
    onSubmit: event => {
      event.preventDefault();

      // Consider clearing the send box only after we received POST_ACTIVITY_PENDING
      // E.g. if the connection is bad, sending the message essentially do nothing but just clearing the send box

      if (sendBoxValue) {
        scrollToEnd();
        submitSendBox();
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
}) => {
  const typeYourMessageString = localize('Type your message', language);

  return (
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
              aria-label={ typeYourMessageString }
              data-id="webchat-sendbox-input"
              disabled={ disabled }
              onChange={ onChange }
              placeholder={ typeYourMessageString }
              ref={ sendFocusRef }
              type="text"
              value={ value }
            />
          }
        </TypeFocusSinkContext.Consumer>
      }
    </form>
  );
})

export { connectSendTextBox }
