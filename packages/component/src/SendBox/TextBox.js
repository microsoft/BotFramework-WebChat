import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import { Context as TypeFocusSinkContext } from '../Utils/TypeFocusSink';
import connectToWebChat from '../connectToWebChat';
import useDisabled from '../hooks/useDisabled';
import useFocusSendBox from '../hooks/useFocusSendBox';
import useLocalize from '../hooks/useLocalize';
import useScrollToEnd from '../hooks/useScrollToEnd';
import useSendBoxValue from '../hooks/useSendBoxValue';
import useStopDictate from '../hooks/useStopDictate';
import useStyleOptions from '../hooks/useStyleOptions';
import useStyleSet from '../hooks/useStyleSet';
import useSubmitSendBox from '../hooks/useSubmitSendBox';

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

function useTextBoxSubmit(setFocus) {
  const [sendBoxValue] = useSendBoxValue();
  const focusSendBox = useFocusSendBox();
  const scrollToEnd = useScrollToEnd();
  const submitSendBox = useSubmitSendBox();

  return useCallback(() => {
    if (sendBoxValue) {
      scrollToEnd();
      submitSendBox();
      setFocus && focusSendBox();
    }
  }, [focusSendBox, scrollToEnd, sendBoxValue, setFocus, submitSendBox]);
}

function useTextBoxValue() {
  const [value, setSendBox] = useSendBoxValue();
  const stopDictate = useStopDictate();

  const setter = useCallback(
    value => {
      setSendBox(value);
      stopDictate();
    },
    [setSendBox, stopDictate]
  );

  return [value, setter];
}

const TextBox = ({ className }) => {
  const [{ sendBoxTextWrap }] = useStyleOptions();
  const [{ sendBoxTextArea: sendBoxTextAreaStyleSet, sendBoxTextBox: sendBoxTextBoxStyleSet }] = useStyleSet();
  const [disabled] = useDisabled();
  const [textBoxValue, setTextBoxValue] = useTextBoxValue();

  const submitTextBox = useTextBoxSubmit();
  const sendBoxString = useLocalize('Sendbox');
  const typeYourMessageString = useLocalize('Type your message');

  const handleChange = useCallback(({ target: { value } }) => setTextBoxValue(value), [setTextBoxValue]);

  const handleKeyPress = useCallback(
    event => {
      const { key, shiftKey } = event;

      if (key === 'Enter' && !shiftKey) {
        event.preventDefault();

        // If text box is submitted, focus on the send box
        submitTextBox(true);
      }
    },
    [submitTextBox]
  );

  const handleSubmit = useCallback(
    event => {
      event.preventDefault();

      // Consider clearing the send box only after we received POST_ACTIVITY_PENDING
      // E.g. if the connection is bad, sending the message essentially do nothing but just clearing the send box
      submitTextBox();
    },
    [submitTextBox]
  );

  return (
    <form
      className={classNames(ROOT_CSS + '', sendBoxTextAreaStyleSet + '', sendBoxTextBoxStyleSet + '', className + '')}
      onSubmit={handleSubmit}
    >
      {
        <TypeFocusSinkContext.Consumer>
          {({ sendFocusRef }) =>
            !sendBoxTextWrap ? (
              <input
                aria-label={sendBoxString}
                data-id="webchat-sendbox-input"
                disabled={disabled}
                onChange={handleChange}
                placeholder={typeYourMessageString}
                ref={sendFocusRef}
                type="text"
                value={textBoxValue}
              />
            ) : (
              <div>
                <textarea
                  aria-label={sendBoxString}
                  data-id="webchat-sendbox-input"
                  disabled={disabled}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder={typeYourMessageString}
                  ref={sendFocusRef}
                  rows="1"
                  value={textBoxValue}
                />
                <div>{textBoxValue + '\n'}</div>
              </div>
            )
          }
        </TypeFocusSinkContext.Consumer>
      }
    </form>
  );
};

TextBox.defaultProps = {
  className: ''
};

TextBox.propTypes = {
  className: PropTypes.string
};

export default TextBox;

export { connectSendTextBox, useTextBoxSubmit, useTextBoxValue };
