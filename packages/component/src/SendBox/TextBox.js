import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { Context as TypeFocusSinkContext } from '../Utils/TypeFocusSink';
import { localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';

const ROOT_CSS = css({
  display: 'flex',

  '& > div, input': {
    flex: 1
  }
});

const connectSendTextBox = (...selectors) =>
  connectToWebChat(
    ({ disabled, focusSendBox, language, scrollToEnd, sendBoxValue, setSendBox, stopDictate, submitSendBox }) => ({
      disabled,
      language,
      onChange: ({ target: { value } }) => {
        setSendBox(value);
        stopDictate();
      },
      onKeyPress: event => {
        const { key, shiftKey } = event;

        if (key === 'Enter' && !shiftKey) {
          event.preventDefault();

          if (sendBoxValue) {
            scrollToEnd();
            submitSendBox();
            focusSendBox();
          }
        }
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
  );

const TextBox = ({ className, disabled, language, onChange, onKeyPress, onSubmit, styleSet, value }) => {
  const typeYourMessageString = localize('Type your message', language);
  const sendBoxString = localize('Sendbox', language);
  const {
    options: { sendBoxTextWrap }
  } = styleSet;

  return (
    <form
      className={classNames(ROOT_CSS + '', styleSet.sendBoxTextArea + '', styleSet.sendBoxTextBox + '', className + '')}
      onSubmit={onSubmit}
    >
      {
        <TypeFocusSinkContext.Consumer>
          {({ sendFocusRef }) =>
            !sendBoxTextWrap ? (
              <input
                aria-label={sendBoxString}
                data-id="webchat-sendbox-input"
                disabled={disabled}
                onChange={onChange}
                placeholder={typeYourMessageString}
                ref={sendFocusRef}
                type="text"
                value={value}
              />
            ) : (
              <div>
                <textarea
                  aria-label={sendBoxString}
                  data-id="webchat-sendbox-input"
                  disabled={disabled}
                  onChange={onChange}
                  onKeyPress={onKeyPress}
                  placeholder={typeYourMessageString}
                  ref={sendFocusRef}
                  rows="1"
                  value={value}
                />
                <div>{value + '\n'}</div>
              </div>
            )
          }
        </TypeFocusSinkContext.Consumer>
      }
    </form>
  );
};

TextBox.defaultProps = {
  className: '',
  disabled: false,
  value: ''
};

TextBox.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  language: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onKeyPress: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  styleSet: PropTypes.shape({
    options: PropTypes.shape({
      sendBoxTextWrap: PropTypes.bool.isRequired
    }).isRequired,
    sendBoxTextArea: PropTypes.any.isRequired,
    sendBoxTextBox: PropTypes.any.isRequired
  }).isRequired,
  value: PropTypes.string
};

export default connectSendTextBox(({ styleSet }) => ({ styleSet }))(TextBox);

export { connectSendTextBox };
