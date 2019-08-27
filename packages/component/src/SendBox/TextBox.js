import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';

import { Context as TypeFocusSinkContext } from '../Utils/TypeFocusSink';
import { useLocalize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import useStyleSet from '../hooks/useStyleSet';
import useWebChat from '../useWebChat';

const ROOT_CSS = css({
  display: 'flex',

  '& > div, input': {
    flex: 1
  }
});

const connectSendTextBox = (...selectors) => {
  console.warn(
    'Web Chat: connectSendTextBox() will be removed on or after 2021-09-27, please use useSendTextBox() instead.'
  );

  return connectToWebChat(
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
};

// TODO: [P2] Revisit these functions. Think about apps that are not React, how useful are these functions appears to them.
const useSendTextBox = () =>
  useWebChat(({ disabled, focusSendBox, scrollToEnd, sendBoxValue, setSendBox, stopDictate, submitSendBox }) => ({
    disabled,
    onChange: useCallback(
      ({ target: { value } }) => {
        setSendBox(value);
        stopDictate();
      },
      [setSendBox, stopDictate]
    ),
    onKeyPress: useCallback(
      event => {
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
      [focusSendBox, scrollToEnd, submitSendBox]
    ),
    onSubmit: useCallback(
      event => {
        event.preventDefault();

        // Consider clearing the send box only after we received POST_ACTIVITY_PENDING
        // E.g. if the connection is bad, sending the message essentially do nothing but just clearing the send box

        if (sendBoxValue) {
          scrollToEnd();
          submitSendBox();
        }
      },
      [scrollToEnd, sendBoxValue, submitSendBox]
    ),
    value: sendBoxValue
  }));

const TextBox = ({ className }) => {
  const { disabled, onChange, onKeyPress, onSubmit, value } = useSendTextBox();
  const styleSet = useStyleSet();
  const typeYourMessageString = useLocalize('Type your message');
  const {
    options: { sendBoxTextWrap }
  } = styleSet;

  return useMemo(
    () => (
      <form
        className={classNames(
          ROOT_CSS + '',
          styleSet.sendBoxTextArea + '',
          styleSet.sendBoxTextBox + '',
          className + ''
        )}
        onSubmit={onSubmit}
      >
        {
          <TypeFocusSinkContext.Consumer>
            {({ sendFocusRef }) =>
              !sendBoxTextWrap ? (
                <input
                  aria-label={typeYourMessageString}
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
                    aria-label={typeYourMessageString}
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
    ),
    [disabled, onChange, onKeyPress, onSubmit, styleSet, typeYourMessageString, value]
  );
};

TextBox.defaultProps = {
  className: ''
};

TextBox.propTypes = {
  className: PropTypes.string
};

export default TextBox;

export { connectSendTextBox, useSendTextBox };
