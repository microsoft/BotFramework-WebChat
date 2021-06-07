import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { MutableRefObject, useCallback, useEffect, useRef } from 'react';

import { ie11 } from '../Utils/detectBrowser';
import AccessibleInputText from '../Utils/AccessibleInputText';
import AutoResizeTextArea from './AutoResizeTextArea';
import connectToWebChat from '../connectToWebChat';
import navigableEvent from '../Utils/TypeFocusSink/navigableEvent';
import useFocus from '../hooks/useFocus';
import useRegisterFocusSendBox from '../hooks/internal/useRegisterFocusSendBox';
import useReplaceEmoticon from '../hooks/internal/useReplaceEmoticon';
import useScrollDown from '../hooks/useScrollDown';
import useScrollToEnd from '../hooks/useScrollToEnd';
import useScrollUp from '../hooks/useScrollUp';
import useStyleSet from '../hooks/useStyleSet';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';

const { useDisabled, useLocalizer, useSendBoxValue, useStopDictate, useStyleOptions, useSubmitSendBox } = hooks;

const ROOT_STYLE = {
  '&.webchat__send-box-text-box': {
    display: 'flex',

    '& .webchat__send-box-text-box__input, & .webchat__send-box-text-box__text-area': {
      flex: 1
    }
  }
};

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

function useTextBoxSubmit(): (setFocus?: boolean | 'sendBox') => void {
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

function useTextBoxValue(): [
  string,
  (
    textBoxValue: string,
    options: { selectionEnd: number; selectionStart: number }
  ) => { selectionEnd: number; selectionStart: number; value: string }
] {
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

const TextBox = ({ className }) => {
  const [, setSendBox] = useSendBoxValue();
  const [{ sendBoxTextBox: sendBoxTextBoxStyleSet }] = useStyleSet();
  const [{ sendBoxTextWrap }] = useStyleOptions();
  const [disabled] = useDisabled();
  const [textBoxValue, setTextBoxValue] = useTextBoxValue();
  const inputElementRef: MutableRefObject<HTMLInputElement & HTMLTextAreaElement> = useRef();
  const localize = useLocalizer();
  const placeCheckpointOnChangeRef = useRef(false);
  const prevInputStateRef: MutableRefObject<{
    selectionEnd: number;
    selectionStart: number;
    value: string;
  }> = useRef();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const scrollDown = useScrollDown();
  const scrollUp = useScrollUp();
  const submitTextBox = useTextBoxSubmit();
  const undoStackRef = useRef([]);

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

  const handleKeyDownCapture = useCallback(
    event => {
      const { ctrlKey, metaKey, shiftKey } = event;

      if (ctrlKey || metaKey || shiftKey) {
        return;
      }

      // Navigable event means the end-user is focusing on an inputtable element, but it is okay to capture the arrow keys.
      if (navigableEvent(event)) {
        let handled = true;

        switch (event.key) {
          case 'End':
            scrollDown({ displacement: Infinity });
            break;

          case 'Home':
            scrollUp({ displacement: Infinity });
            break;

          case 'PageDown':
            scrollDown();
            break;

          case 'PageUp':
            scrollUp();
            break;

          default:
            handled = false;
            break;
        }

        if (handled) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    },
    [scrollDown, scrollUp]
  );

  const focusCallback = useCallback(
    ({ noKeyboard } = {}) => {
      const { current } = inputElementRef;

      if (current) {
        // The "disable soft keyboard on mobile devices" logic will not work on IE11. It will cause the <input> to become read-only until next focus.
        // Thus, no mobile devices carry IE11 so we don't need to explicitly disable soft keyboard on IE11.
        // See #3757 for repro and details.
        if (noKeyboard && !ie11) {
          // To not activate the virtual keyboard while changing focus to an input, we will temporarily set it as read-only and flip it back.
          // https://stackoverflow.com/questions/7610758/prevent-iphone-default-keyboard-when-focusing-an-input/7610923
          const readOnly = current.getAttribute('readonly');

          current.setAttribute('readonly', 'readonly');

          setTimeout(() => {
            const { current } = inputElementRef;

            if (current) {
              current.focus();
              readOnly ? current.setAttribute('readonly', readOnly) : current.removeAttribute('readonly');
            }
          }, 0);
        } else {
          current.focus();
        }
      }
    },
    [inputElementRef]
  );

  useRegisterFocusSendBox(focusCallback);

  return (
    <form
      aria-disabled={disabled}
      className={classNames(
        'webchat__send-box-text-box',
        rootClassName,
        sendBoxTextBoxStyleSet + '',
        (className || '') + ''
      )}
      onSubmit={disabled ? PREVENT_DEFAULT_HANDLER : handleSubmit}
    >
      {!sendBoxTextWrap ? (
        <AccessibleInputText
          aria-label={sendBoxString}
          className="webchat__send-box-text-box__input"
          data-id="webchat-sendbox-input"
          disabled={disabled}
          enterKeyHint="send"
          inputMode="text"
          onChange={disabled ? undefined : handleChange}
          onFocus={disabled ? undefined : handleFocus}
          onKeyDown={disabled ? undefined : handleKeyDown}
          onKeyDownCapture={disabled ? undefined : handleKeyDownCapture}
          onKeyPress={disabled ? undefined : handleKeyPress}
          onSelect={disabled ? undefined : handleSelect}
          placeholder={typeYourMessageString}
          readOnly={disabled}
          ref={inputElementRef}
          type="text"
          value={textBoxValue}
        />
      ) : (
        <AutoResizeTextArea
          aria-label={sendBoxString}
          className="webchat__send-box-text-box__text-area"
          data-id="webchat-sendbox-input"
          disabled={disabled}
          enterKeyHint="send"
          inputMode="text"
          onChange={disabled ? undefined : handleChange}
          onFocus={disabled ? undefined : handleFocus}
          onKeyDown={disabled ? undefined : handleKeyDown}
          onKeyDownCapture={disabled ? undefined : handleKeyDownCapture}
          onKeyPress={disabled ? undefined : handleKeyPress}
          onSelect={disabled ? undefined : handleSelect}
          placeholder={typeYourMessageString}
          readOnly={disabled}
          ref={inputElementRef}
          rows={1}
          textAreaClassName="webchat__send-box-text-box__html-text-area"
          value={textBoxValue}
        />
      )}
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
