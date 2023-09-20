import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef } from 'react';

import { ie11 } from '../Utils/detectBrowser';
import AccessibleInputText from '../Utils/AccessibleInputText';
import AutoResizeTextArea from './AutoResizeTextArea';
import navigableEvent from '../Utils/TypeFocusSink/navigableEvent';
import useRegisterFocusSendBox from '../hooks/internal/useRegisterFocusSendBox';
import useScrollDown from '../hooks/useScrollDown';
import useScrollUp from '../hooks/useScrollUp';
import useStyleSet from '../hooks/useStyleSet';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';
import useSubmit from '../providers/internal/SendBox/useSubmit';
import withEmoji from '../withEmoji/withEmoji';

import type { MutableRefObject } from 'react';

const { useDisabled, useLocalizer, usePonyfill, useSendBoxValue, useStopDictate, useStyleOptions } = hooks;

const ROOT_STYLE = {
  '&.webchat__send-box-text-box': {
    display: 'flex',

    '& .webchat__send-box-text-box__input, & .webchat__send-box-text-box__text-area': {
      flex: 1
    }
  }
};

/**
 * Submits the text box and optionally set the focus after send.
 */
type SubmitTextBoxFunction = {
  /**
   * Submits the text box, without setting the focus after send.
   *
   * @deprecated Instead of passing `false`, you should leave the `setFocus` argument `undefined`.
   */
  (setFocus: false): void;

  /**
   * Submits the text box and optionally set the focus after send.
   */
  (setFocus?: 'sendBox' | 'sendBoxWithoutKeyboard'): void;
};

function useTextBoxSubmit(): SubmitTextBoxFunction {
  const submit = useSubmit();

  return useCallback<SubmitTextBoxFunction>(
    (setFocus?: false | 'sendBox' | 'sendBoxWithoutKeyboard') => submit({ setFocus: setFocus || undefined }),
    [submit]
  );
}

function useTextBoxValue(): [string, (textBoxValue: string) => void] {
  const [value, setValue] = useSendBoxValue();
  const stopDictate = useStopDictate();

  const setter = useCallback<(nextValue: string) => void>(
    nextValue => {
      if (typeof nextValue !== 'string') {
        throw new Error('botframework-webchat: First argument passed to useTextBoxValue() must be a string.');
      }

      setValue(nextValue);
      stopDictate();
    },
    [setValue, stopDictate]
  );

  return [value, setter];
}

const PREVENT_DEFAULT_HANDLER = event => event.preventDefault();

const SingleLineTextBox = withEmoji(AccessibleInputText);
const MultiLineTextBox = withEmoji(AutoResizeTextArea);

const TextBox = ({ className }) => {
  const [value, setValue] = useSendBoxValue();
  const [{ sendBoxTextBox: sendBoxTextBoxStyleSet }] = useStyleSet();
  const [{ emojiSet, sendBoxTextWrap }] = useStyleOptions();
  const [{ setTimeout }] = usePonyfill();
  const [disabled] = useDisabled();
  const inputElementRef: MutableRefObject<HTMLInputElement & HTMLTextAreaElement> = useRef();
  const localize = useLocalizer();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const scrollDown = useScrollDown();
  const scrollUp = useScrollUp();
  const submitTextBox = useTextBoxSubmit();

  const sendBoxString = localize('TEXT_INPUT_ALT');
  const typeYourMessageString = localize('TEXT_INPUT_PLACEHOLDER');

  const handleKeyPress = useCallback(
    event => {
      const { key, shiftKey } = event;

      if (key === 'Enter' && !shiftKey) {
        event.preventDefault();

        // If text box is submitted, focus on the send box
        submitTextBox('sendBox');
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

  const focusCallback = useCallback<(options?: { noKeyboard?: boolean }) => void>(
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

          // TODO: [P2] We should update this logic to handle quickly-successive `focusCallback`.
          //       If a succeeding `focusCallback` is being called, the `setTimeout` should run immediately.
          //       Or the second `focusCallback` should not set `readonly` to `true`.
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
    [inputElementRef, setTimeout]
  );

  useRegisterFocusSendBox(focusCallback);

  const emojiMap = useMemo(() => new Map(Object.entries(emojiSet)), [emojiSet]);

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
        <SingleLineTextBox
          aria-label={sendBoxString}
          className="webchat__send-box-text-box__input"
          data-id="webchat-sendbox-input"
          disabled={disabled}
          emojiMap={emojiMap}
          enterKeyHint="send"
          inputMode="text"
          onChange={setValue}
          onKeyDownCapture={disabled ? undefined : handleKeyDownCapture}
          onKeyPress={disabled ? undefined : handleKeyPress}
          placeholder={typeYourMessageString}
          readOnly={disabled}
          ref={inputElementRef}
          type="text"
          value={value}
        />
      ) : (
        <MultiLineTextBox
          aria-label={sendBoxString}
          className="webchat__send-box-text-box__text-area"
          data-id="webchat-sendbox-input"
          disabled={disabled}
          emojiMap={emojiMap}
          enterKeyHint="send"
          inputMode="text"
          onChange={setValue}
          onKeyDownCapture={disabled ? undefined : handleKeyDownCapture}
          onKeyPress={disabled ? undefined : handleKeyPress}
          placeholder={typeYourMessageString}
          readOnly={disabled}
          ref={inputElementRef}
          rows={1}
          textAreaClassName="webchat__send-box-text-box__html-text-area"
          value={value}
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

export { useTextBoxSubmit, useTextBoxValue };
