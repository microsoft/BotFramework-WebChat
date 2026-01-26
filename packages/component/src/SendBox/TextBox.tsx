import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { useCallback, useMemo, useRef } from 'react';

import AccessibleInputText from '../Utils/AccessibleInputText';
import navigableEvent from '../Utils/TypeFocusSink/navigableEvent';
import { useRegisterFocusSendBox, type SendBoxFocusOptions } from '../hooks/sendBoxFocus';
import { useStyleToEmotionObject } from '../hooks/internal/styleToEmotionObject';
import useScrollDown from '../hooks/useScrollDown';
import useScrollUp from '../hooks/useScrollUp';
import useStyleSet from '../hooks/useStyleSet';
import useSubmit from '../providers/internal/SendBox/useSubmit';
import withEmoji from '../withEmoji/withEmoji';
import AutoResizeTextArea from './AutoResizeTextArea';

import type { MutableRefObject } from 'react';
import testIds from '../testIds';

const { useLocalizer, useSendBoxValue, useStopDictate, useStyleOptions, useUIState } = hooks;

const DEFAULT_INPUT_MODE = 'text';

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

const TextBox = ({ className = '' }: Readonly<{ className?: string | undefined }>) => {
  const [value, setValue] = useSendBoxValue();
  const [{ sendBoxTextBox: sendBoxTextBoxStyleSet }] = useStyleSet();
  const [{ emojiSet, sendBoxTextWrap }] = useStyleOptions();
  const [uiState] = useUIState();
  const inputElementRef: MutableRefObject<HTMLInputElement & HTMLTextAreaElement> = useRef();
  const localize = useLocalizer();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const scrollDown = useScrollDown();
  const scrollUp = useScrollUp();
  const submitTextBox = useTextBoxSubmit();

  const disabled = uiState === 'disabled';
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

  const focusCallback = useCallback(
    ({ noKeyboard }: SendBoxFocusOptions) => {
      const { current } = inputElementRef;

      // Setting `inputMode` to `none` temporarily to suppress soft keyboard in iOS.
      // We will revert the change once the end-user tap on the send box.
      // This code path is only triggered when the user press "send" button to send the message, instead of pressing ENTER key.
      noKeyboard && current?.setAttribute('inputmode', 'none');
      current?.focus();
    },
    [inputElementRef]
  );

  useRegisterFocusSendBox(focusCallback);

  const handleClick = useCallback(
    ({ currentTarget }) => currentTarget.setAttribute('inputmode', DEFAULT_INPUT_MODE),
    []
  );

  const emojiMap = useMemo(() => new Map<string, string>(Object.entries(emojiSet)), [emojiSet]);

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
          data-testid={testIds.sendBoxTextBox}
          disabled={disabled}
          emojiMap={emojiMap}
          enterKeyHint="send"
          inputMode={DEFAULT_INPUT_MODE}
          onChange={setValue}
          onClick={handleClick}
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
          data-testid={testIds.sendBoxTextBox}
          disabled={disabled}
          emojiMap={emojiMap}
          enterKeyHint="send"
          inputMode={DEFAULT_INPUT_MODE}
          onChange={setValue}
          onClick={handleClick}
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

export default TextBox;

export { useTextBoxSubmit, useTextBoxValue };
