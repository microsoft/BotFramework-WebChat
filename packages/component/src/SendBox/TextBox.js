import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { forwardRef, useCallback, useEffect, useRef } from 'react';

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
    (nextValue, { selectionEnd, selectionStart } = {}) => {
      if (typeof nextValue !== 'string') {
        throw new Error('botframework-webchat: First argument passed to useTextBoxValue() must be a string.');
      }

      // Currently, we cannot detect whether the change is due to clipboard paste or pressing a key on the keyboard.
      // We should not change to emoji when the user is pasting text.
      // We would assume, for a single character addition, the user must be pressing a key.
      if (nextValue.length === value.length + 1) {
        const {
          selectionEnd: nextSelectionEnd,
          selectionStart: nextSelectionStart,
          value: nextValueWithEmoji
        } = replaceEmoticon({ selectionEnd, selectionStart, value: nextValue });

        selectionEnd = nextSelectionEnd;
        selectionStart = nextSelectionStart;
        nextValue = nextValueWithEmoji;
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

const TextBoxCore = forwardRef(({ className }, forwardedRef) => {
  const [, setSendBox] = useSendBoxValue();
  const [{ sendBoxTextArea: sendBoxTextAreaStyleSet, sendBoxTextBox: sendBoxTextBoxStyleSet }] = useStyleSet();
  const [{ sendBoxTextWrap }] = useStyleOptions();
  const [disabled] = useDisabled();
  const [textBoxValue, setTextBoxValue] = useTextBoxValue();
  const inputElementRef = useRef();
  const localize = useLocalizer();
  const placeCheckpointOnChangeRef = useRef(false);
  const prevInputStateRef = useRef();
  const submitTextBox = useTextBoxSubmit();
  const undoStackRef = useRef([]);

  const inputRefCallback = useCallback(
    element => {
      if (typeof forwardedRef === 'function') {
        forwardedRef(element);
      } else if (forwardedRef) {
        forwardedRef.current = element;
      }

      inputElementRef.current = element;
    },
    [forwardedRef, inputElementRef]
  );

  const sendBoxString = localize('TEXT_INPUT_ALT');
  const typeYourMessageString = localize('TEXT_INPUT_PLACEHOLDER');

  const rememberInputState = useCallback(() => {
    const {
      current: { selectionEnd, selectionStart, value }
    } = inputElementRef;

    prevInputStateRef.current = { selectionEnd, selectionStart, value };
  }, [inputElementRef, prevInputStateRef]);

  // This is for TypeFocusSink. When the focus in on the script, then starting press "a", without this line, it would cause errors.
  // We call rememberInputState() when "onFocus" event is fired, but since this is from TypeFocusSink, we are not able to receive "onFocus" event before it happen.
  useEffect(rememberInputState, [rememberInputState]);

  // This is for moving the selection while setting the send box value.
  // If we only use setSendBox, we will need to wait for the next render cycle to get the value in, before we can set selectionEnd/Start.
  const setSelectionRangeAndValue = useCallback(
    ({ selectionEnd, selectionStart, value }) => {
      if (inputElementRef.current) {
        // We need to set the value, before selectionStart/selectionEnd.
        inputElementRef.current.value = value;

        inputElementRef.current.selectionStart = selectionStart;
        inputElementRef.current.selectionEnd = selectionEnd;
      }

      setSendBox(value);
    },
    [inputElementRef, setSendBox]
  );

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
    [placeCheckpointOnChangeRef, prevInputStateRef, setSelectionRangeAndValue, setTextBoxValue, undoStackRef]
  );

  const handleFocus = useCallback(() => {
    rememberInputState();

    placeCheckpointOnChangeRef.current = true;
  }, [placeCheckpointOnChangeRef, rememberInputState]);

  const handleKeyDown = useCallback(
    event => {
      const { ctrlKey, key, metaKey } = event;

      if ((ctrlKey || metaKey) && (key === 'Z' || key === 'z')) {
        event.preventDefault();

        const poppedInputState = undoStackRef.current.pop();

        if (poppedInputState) {
          prevInputStateRef.current = { ...poppedInputState };
        } else {
          prevInputStateRef.current = { selectionEnd: 0, selectionStart: 0, value: '' };
        }

        setSelectionRangeAndValue(prevInputStateRef.current);
      }
    },
    [prevInputStateRef, setSelectionRangeAndValue, undoStackRef]
  );

  const handleKeyPress = useCallback(
    event => {
      const { key, shiftKey } = event;

      if (key === 'Enter' && !shiftKey) {
        event.preventDefault();

        // If text box is submitted, focus on the send box
        submitTextBox('sendBox');

        // After submit, we will clear the undo stack.
        undoStackRef.current = [];
      }
    },
    [submitTextBox, undoStackRef]
  );

  const handleSelect = useCallback(
    ({ target: { selectionEnd, selectionStart, value } }) => {
      if (value === prevInputStateRef.current.value) {
        // When caret move, we should push to undo stack on change.
        placeCheckpointOnChangeRef.current = true;
      }

      prevInputStateRef.current = { selectionEnd, selectionStart, value };
    },
    [placeCheckpointOnChangeRef, prevInputStateRef]
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
    [submitTextBox, undoStackRef]
  );

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
      {!sendBoxTextWrap ? (
        <AccessibleInputText
          aria-label={sendBoxString}
          className="webchat__send-box-text-box__input"
          data-id="webchat-sendbox-input"
          disabled={disabled}
          enterkeyhint="send" // The version of React we are using does not support "enterKeyHint" yet
          inputMode="text"
          onChange={disabled ? undefined : handleChange}
          onFocus={disabled ? undefined : handleFocus}
          onKeyDown={disabled ? undefined : handleKeyDown}
          onKeyPress={disabled ? undefined : handleKeyPress}
          onSelect={disabled ? undefined : handleSelect}
          placeholder={typeYourMessageString}
          readOnly={disabled}
          ref={inputRefCallback}
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
            enterkeyhint="send" // The version of React we are using does not support "enterKeyHint" yet
            inputMode="text"
            onChange={disabled ? undefined : handleChange}
            onFocus={disabled ? undefined : handleFocus}
            onKeyDown={disabled ? undefined : handleKeyDown}
            onKeyPress={disabled ? undefined : handleKeyPress}
            onSelect={disabled ? undefined : handleSelect}
            placeholder={typeYourMessageString}
            readOnly={disabled}
            ref={inputRefCallback}
            rows="1"
            value={textBoxValue}
          />
          <div className="webchat__send-box-text-box__text-area-doppelganger">{textBoxValue + '\n'}</div>
        </div>
      )}
      {disabled && <div className="webchat__send-box-text-box__glass" />}
    </form>
  );
});

TextBoxCore.defaultProps = {
  className: ''
};

TextBoxCore.propTypes = {
  className: PropTypes.string
};

const TextBox = ({ className }) => (
  // For DOM node referenced by sendFocusRef, we are using a hack to focus on it.
  // By flipping readOnly attribute while setting focus, we can focus on text box without popping the virtual keyboard on mobile device.
  <TypeFocusSinkContext.Consumer>
    {({ sendFocusRef }) => <TextBoxCore className={className} ref={sendFocusRef} />}
  </TypeFocusSinkContext.Consumer>
);

TextBox.defaultProps = {
  className: ''
};

TextBox.propTypes = {
  className: PropTypes.string
};

export default TextBox;

export { connectSendTextBox, useTextBoxSubmit, useTextBoxValue };
