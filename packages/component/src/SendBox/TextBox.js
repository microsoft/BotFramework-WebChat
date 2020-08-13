import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef } from 'react';

import { Context as TypeFocusSinkContext } from '../Utils/TypeFocusSink';
import AccessibleInputText from '../Utils/AccessibleInputText';
import AccessibleTextArea from '../Utils/AccessibleTextArea';
import connectToWebChat from '../connectToWebChat';
// import getDiffIndex from '../Utils/getDiffIndex';
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
  const [value, setSendBox] = useSendBoxValue();
  const replaceEmoticon = useReplaceEmoticon();
  const stopDictate = useStopDictate();

  const setter = useCallback(
    (nextValue, { selectionEnd, selectionStart }) => {
      if (typeof nextValue !== 'string') {
        throw new Error('botframework-webchat: First argument passed to useTextBoxValue() must be a string.');
      }

      let nextSelectionEnd = selectionEnd;
      let nextSelectionStart = selectionStart;

      if (nextValue.length === value.length + 1) {
        // We only do emoji conversion when a single character is added.
        const { emojiChange, valueWithEmoji } = replaceEmoticon({ selectionStart, value: nextValue });

        if (valueWithEmoji !== nextValue) {
          nextSelectionEnd = nextSelectionStart = emojiChange;
          nextValue = valueWithEmoji;
        }
      }

      setSendBox(nextValue);
      stopDictate();

      return {
        selectionEnd: nextSelectionEnd,
        selectionStart: nextSelectionStart,
        value: nextValue
      };
    },
    [replaceEmoticon, setSendBox, stopDictate, value]
  );

  return [value, setter];
}

// Please add test for checking the caret position.
// Because in our screenshot test, we hide the cursor (blink is time-sensitive and making test unreliable)
// So we didn't actually tested whether "selectionStart" is correctly set or not.

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

  const sendBoxString = localize('TEXT_INPUT_ALT');
  const typeYourMessageString = localize('TEXT_INPUT_PLACEHOLDER');
  const nextSelectionRef = useRef();
  const prevInputStateRef = useRef();
  const placeCheckpointOnChangeRef = useRef(false);

  const rememberInputState = useCallback(() => {
    const {
      current: { selectionEnd, selectionStart, value }
    } = inputRef;

    prevInputStateRef.current = { selectionEnd, selectionStart, value };
  }, [inputRef, prevInputStateRef]);

  useEffect(() => {
    // This is for TypeFocusSink. When the focus in on the script, then starting press "a".
    rememberInputState();
  }, [rememberInputState]);

  useEffect(() => {
    // If nextSelectionRef is set, move to this selection.
    if (nextSelectionRef.current) {
      inputRef.current.selectionStart = nextSelectionRef.current.selectionStart;
      inputRef.current.selectionEnd = nextSelectionRef.current.selectionEnd;

      nextSelectionRef.current = undefined;
    }
  }, [inputRef, nextSelectionRef, nextSelectionRef.current]);

  const handleChange = useCallback(
    event => {
      const {
        target: { selectionEnd, selectionStart, value }
      } = event;

      if (placeCheckpointOnChangeRef.current) {
        undoStackRef.current.push({
          selectionEnd: prevInputStateRef.current.selectionEnd,
          selectionStart: prevInputStateRef.current.selectionStart,
          value: prevInputStateRef.current.value
        });

        placeCheckpointOnChangeRef.current = false;
      }

      const { selectionEnd: nextSelectionEnd, selectionStart: nextSelectionStart, value: nextValue } = setTextBoxValue(
        value,
        { selectionStart },
        undoStackRef
      );

      // If an emoticon is converted to emoji, place another checkpoint.
      if (nextValue !== value) {
        undoStackRef.current.push({
          selectionEnd,
          selectionStart,
          value
        });

        placeCheckpointOnChangeRef.current = true;

        nextSelectionRef.current = {
          selectionEnd: nextSelectionEnd,
          selectionStart: nextSelectionStart
        };
      }
    },
    [prevInputStateRef, setTextBoxValue, undoStackRef, setTextBoxValue]
  );

  const handleFocus = useCallback(() => {
    rememberInputState();

    placeCheckpointOnChangeRef.current = true;
  }, [placeCheckpointOnChangeRef, rememberInputState]);

  // TODO: [P1] We should support key repeat (holding Z should keep undo-ing)
  const handleKeyDown = useCallback(
    event => {
      const { ctrlKey, key } = event;

      if (ctrlKey && (key === 'Z' || key === 'z')) {
        event.preventDefault();

        const poppedInputState = undoStackRef.current.pop();

        if (poppedInputState) {
          setSendBox(poppedInputState.value);

          nextSelectionRef.current = {
            selectionEnd: poppedInputState.selectionEnd,
            selectionStart: poppedInputState.selectionStart
          };
        } else {
          setSendBox(''); // Do we need this one?
        }

        rememberInputState();
      }
    },
    [rememberInputState, setSendBox, undoStackRef]
  );

  // TODO: I think we can take away this one.
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

  // TODO: [P2] On submit, we should throw away the undo stack.
  const handleSubmit = useCallback(
    event => {
      event.preventDefault();

      // Consider clearing the send box only after we received POST_ACTIVITY_PENDING
      // E.g. if the connection is bad, sending the message essentially do nothing but just clearing the send box
      submitTextBox();
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

  // TODO: [P2] Add enterkeyhint="send" and inputmode="text".
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
                onChange={disabled ? undefined : handleChange}
                onFocus={disabled ? undefined : handleFocus}
                onKeyDown={disabled ? undefined : handleKeyDown}
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
                  onChange={disabled ? undefined : handleChange}
                  onFocus={disabled ? undefined : handleFocus}
                  onKeyDown={disabled ? undefined : handleKeyDown}
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
