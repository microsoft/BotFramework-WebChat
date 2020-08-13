import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef } from 'react';

import { Context as TypeFocusSinkContext } from '../Utils/TypeFocusSink';
import AccessibleInputText from '../Utils/AccessibleInputText';
import AccessibleTextArea from '../Utils/AccessibleTextArea';
import connectToWebChat from '../connectToWebChat';
import useDisabled from '../hooks/useDisabled';
import useFocus from '../hooks/useFocus';
import useLocalizer from '../hooks/useLocalizer';
import useReplaceEmoticon from '../hooks/internal/useReplaceEmoticon';
import useScrollToEnd from '../hooks/useScrollToEnd';
import useSendBoxValue from '../hooks/useSendBoxValue';
import useStopDictate from '../hooks/useStopDictate';
import useStyleOptions from '../hooks/useStyleOptions';
import useStyleSet from '../hooks/useStyleSet';
import useSubmitSendBox from '../hooks/useSubmitSendBox';

const ROOT_CSS = css({
  '&.webchat__send-box-text-box': {
    display: 'flex',

    '& .webchat__send-box-text-box__input, & .webchat__send-box-text-box__text-area-box': {
      flex: 1
    }
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

function useTextBoxSubmit() {
  const [sendBoxValue] = useSendBoxValue();
  const focus = useFocus();
  const scrollToEnd = useScrollToEnd();
  const submitSendBox = useSubmitSendBox();

  return useCallback(
    setFocus => {
      if (sendBoxValue) {
        scrollToEnd();
        submitSendBox();

        if (setFocus) {
          if (setFocus === true) {
            console.warn(
              `"botframework-webchat: Passing "true" to "useTextBoxSubmit" is deprecated and will be removed on or after 2022-04-23. Please pass "sendBox" instead."`
            );

            focus('sendBox');
          } else {
            focus(setFocus);
          }
        }
      }

      return !!sendBoxValue;
    },
    [focus, scrollToEnd, sendBoxValue, submitSendBox]
  );
}

function useTextBoxValue() {
  const [value, setValue] = useSendBoxValue();
  const replaceEmoticon = useReplaceEmoticon();
  const stopDictate = useStopDictate();

  const setter = useCallback(
    // TODO: Add test for
    // 1. useSendBoxTextBoxValue('abc');
    // 2. useSendBoxTextBoxValue('abc', { selectionEnd: 3, selectionStart: 3 });
    (nextValue, { selectionEnd, selectionStart } = {}) => {
      if (typeof nextValue !== 'string') {
        throw new Error('botframework-webchat: First argument passed to useTextBoxValue() must be a string.');
      }

      // Currently, we cannot detect whether the change is due to clipboard paste or pressing a key on the keyboard.
      // We should not change to emoji when the user is pasting text.
      // We would assume, for a single character addition, the user must be pressing a key.
      if (nextValue.length === value.length + 1) {
        const result = replaceEmoticon({ selectionEnd, selectionStart, value: nextValue });

        selectionEnd = result.selectionEnd;
        selectionStart = result.selectionStart;
        nextValue = result.value;
      }

      setValue(nextValue);
      stopDictate();

      return {
        selectionEnd,
        selectionStart,
        value: nextValue
      };
    },
    [replaceEmoticon, setValue, stopDictate, value]
  );

  return [value, setter];
}

const PREVENT_DEFAULT_HANDLER = event => event.preventDefault();

const TextBox = ({ className }) => {
  const [{ sendBoxTextWrap }] = useStyleOptions();
  const [{ sendBoxTextArea: sendBoxTextAreaStyleSet, sendBoxTextBox: sendBoxTextBoxStyleSet }] = useStyleSet();
  const [disabled] = useDisabled();
  const [, setSendBox] = useSendBoxValue();
  const [textBoxValue, setTextBoxValue] = useTextBoxValue();
  const localize = useLocalizer();
  const submitTextBox = useTextBoxSubmit();
  const inputRef = useRef();
  const undoStackRef = useRef([]);

  const placeCheckpointOnChangeRef = useRef(false);
  const prevInputStateRef = useRef();
  const sendBoxString = localize('TEXT_INPUT_ALT');
  const typeYourMessageString = localize('TEXT_INPUT_PLACEHOLDER');

  const rememberInputState = useCallback(() => {
    const {
      current: { selectionEnd, selectionStart, value }
    } = inputRef;

    prevInputStateRef.current = { selectionEnd, selectionStart, value };
  }, [inputRef, prevInputStateRef]);

  // This is for moving the selection while setting the send box value.
  // If we only use setSendBox, we will need to wait for the next render cycle to get the value in, before we can set selectionEnd/Start.
  const setSelectionRangeAndValue = useCallback(
    ({ selectionEnd, selectionStart, value }) => {
      if (inputRef.current) {
        // We need to set the value, before selectionStart/selectionEnd.
        inputRef.current.value = value;

        inputRef.current.selectionStart = selectionStart;
        inputRef.current.selectionEnd = selectionEnd;
      }

      setSendBox(value);
    },
    [setSendBox]
  );

  // This is for TypeFocusSink. When the focus in on the script, then starting press "a", without this line, it would cause errors.
  useEffect(rememberInputState, [rememberInputState]);

  const handleChange = useCallback(
    event => {
      const {
        target: { selectionEnd, selectionStart, value }
      } = event;

      if (placeCheckpointOnChangeRef.current) {
        undoStackRef.current.push({ ...prevInputStateRef.current });

        placeCheckpointOnChangeRef.current = false;
      }

      const nextInputState = setTextBoxValue(value, { selectionEnd, selectionStart });

      // If an emoticon is converted to emoji, place another checkpoint.
      if (nextInputState.value !== value) {
        undoStackRef.current.push({ selectionEnd, selectionStart, value });

        placeCheckpointOnChangeRef.current = true;

        setSelectionRangeAndValue(nextInputState);
      }
    },
    [prevInputStateRef, setTextBoxValue, undoStackRef, setTextBoxValue]
  );

  const handleFocus = useCallback(() => {
    rememberInputState();

    placeCheckpointOnChangeRef.current = true;
  }, [placeCheckpointOnChangeRef, rememberInputState]);

  const handleKeyPress = useCallback(
    event => {
      const { ctrlKey, key, shiftKey } = event;

      if (key === 'Enter' && !shiftKey) {
        event.preventDefault();

        // If text box is submitted, focus on the send box
        submitTextBox(true);

        // After submit, we will clear the undo stack.
        undoStackRef.current = [];
      } else if (ctrlKey && (key === 'Z' || key === 'z')) {
        event.preventDefault();

        const poppedInputState = undoStackRef.current.pop();

        if (poppedInputState) {
          prevInputStateRef.current = { ...poppedInputState };

          setSelectionRangeAndValue(poppedInputState);
        } else {
          prevInputStateRef.current = { selectionEnd: 0, selectionStart: 0, value: '' };

          setSendBox('');
        }
      }
    },
    [setSendBox, submitTextBox, undoStackRef]
  );

  const handleSelect = useCallback(
    ({ target: { selectionEnd, selectionStart, value } }) => {
      if (value === prevInputStateRef.current.value) {
        // When caret move, we should push to undo stack on change.
        placeCheckpointOnChangeRef.current = true;
      }

      prevInputStateRef.current = { selectionEnd, selectionStart, value };
    },
    [prevInputStateRef]
  );

  const handleSubmit = useCallback(
    event => {
      event.preventDefault();

      // Consider clearing the send box only after we received POST_ACTIVITY_PENDING
      // E.g. if the connection is bad, sending the message essentially do nothing but just clearing the send box
      submitTextBox();

      // After submit, we will clear the undo stack.
      undoStackRef.current = [];
    },
    [submitTextBox]
  );

  const getRef = (...refs) => {
    const filteredRefs = refs.filter(() => true);
    if (!filteredRefs.length) return null;
    if (filteredRefs.length === 1) return filteredRefs[0];
    return inst => {
      for (const ref of filteredRefs) {
        if (typeof ref === 'function') {
          ref(inst);
        } else if (ref) {
          ref.current = inst;
        }
      }
    };
  };

  return (
    <form
      aria-disabled={disabled}
      className={classNames(
        ROOT_CSS + '',
        sendBoxTextAreaStyleSet + '',
        sendBoxTextBoxStyleSet + '',
        'webchat__send-box-text-box',
        className + ''
      )}
      onSubmit={disabled ? PREVENT_DEFAULT_HANDLER : handleSubmit}
    >
      {
        // For DOM node referenced by sendFocusRef, we are using a hack to focus on it.
        // By flipping readOnly attribute while setting focus, we can focus on text box without popping the virtual keyboard on mobile device.
        <TypeFocusSinkContext.Consumer>
          {({ sendFocusRef }) =>
            !sendBoxTextWrap ? (
              <AccessibleInputText
                aria-label={sendBoxString}
                className="webchat__send-box-text-box__input"
                data-id="webchat-sendbox-input"
                disabled={disabled}
                enterKeyHint="send"
                inputMode="text"
                onChange={disabled ? undefined : handleChange}
                onFocus={disabled ? undefined : handleFocus}
                onKeyPress={disabled ? undefined : handleKeyPress}
                onSelect={disabled ? undefined : handleSelect}
                placeholder={typeYourMessageString}
                readOnly={disabled}
                ref={getRef(sendFocusRef, inputRef)}
                type="text"
                value={textBoxValue}
              />
            ) : (
              <div className="webchat__send-box-text-box__text-area-box">
                <AccessibleTextArea
                  aria-label={sendBoxString}
                  className="webchat__send-box-text-box__text-area"
                  data-id="webchat-sendbox-input"
                  disabled={disabled}
                  enterKeyHint="send"
                  inputMode="text"
                  onChange={disabled ? undefined : handleChange}
                  onFocus={disabled ? undefined : handleFocus}
                  onKeyPress={disabled ? undefined : handleKeyPress}
                  onSelect={disabled ? undefined : handleSelect}
                  placeholder={typeYourMessageString}
                  readOnly={disabled}
                  ref={getRef(sendFocusRef, inputRef)}
                  rows="1"
                  value={textBoxValue}
                />
                <div className="webchat__send-box-text-box__text-area-doppelganger">{textBoxValue + '\n'}</div>
              </div>
            )
          }
        </TypeFocusSinkContext.Consumer>
      }
      {disabled && <div className="webchat__send-box-text-box__glass" />}
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
