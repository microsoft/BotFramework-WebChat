import { hooks } from 'botframework-webchat-api';
import { useRefFrom } from 'use-ref-from';
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import SendBoxContext from './private/Context';
import useFocus from '../../../hooks/useFocus';
import useScrollToEnd from '../../../hooks/useScrollToEnd';
import useStyleToEmotionObject from '../../../hooks/internal/useStyleToEmotionObject';
import useUniqueId from '../../../hooks/internal/useUniqueId';

import type { ContextType, SendError } from './private/types';
import type { PropsWithChildren } from 'react';

const { useConnectivityStatus, useLocalizer, usePonyfill, useSendBoxValue, useSubmitSendBox } = hooks;

const SUBMIT_ERROR_MESSAGE_STYLE = {
  '&.webchat__submit-error-message': {
    // .sr-only - This component is intended to be invisible to the visual Web Chat user, but read by the AT when using a screen reader
    color: 'transparent',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    // We need to set top: 0, otherwise, it will repro:
    // - Run NVDA
    // - Make the transcript long enough to show the scrollbar
    // - Press SHIFT-TAB, focus on upload button
    // - Press up arrow multiple times
    top: 0,
    whiteSpace: 'nowrap',
    width: 1
  }
};

// False positive: we are using `setTimeout` as a type.
// eslint-disable-next-line no-restricted-globals
type Timeout = ReturnType<typeof setTimeout>;

const TIME_TO_QUEUE_ERROR_MESSAGE = 500;
const TIME_TO_RESET_ERROR_MESSAGE = 50;

// This component is marked as internal because it is not fully implemented and is not ready to be consumed publicly.
// When it is done, it should provide and replace all the functionalities we did in Redux, including but not limited to:

// - Speech interims
// - Maintain text box value
// - Multiple <SendBoxComposer> in a single Web Chat instance
//    - Web devs should be able to put an individual send box instance into an activity
//    - The send box instance in the activity, should be separated from the bottommost send box
//    - The valued typed inside the activity, should be separated from the value typed into the bottommost send box

// In the old days, we use Redux to keep the send box state.
// However, when web devs put 2 send box on their page, it makes things complex because both send boxes will interact with each other.
// We would rather have them separate. If web devs want them to interact with each other, they will do the wiring themselves.

type ErrorMessageStringMap = ReadonlyMap<SendError, string>;

// TODO: [P2] Complete this component.
const SendBoxComposer = ({ children }: PropsWithChildren<{}>) => {
  const [{ clearTimeout, setTimeout }] = usePonyfill();
  const [connectivityStatus] = useConnectivityStatus();
  const [error, setError] = useState<SendError | false>(false);
  const [sendBoxValue] = useSendBoxValue();
  const apiSubmitSendBox = useSubmitSendBox();
  const focus = useFocus();
  const localize = useLocalizer();
  const scrollToEnd = useScrollToEnd();
  const styleToEmotionObject = useStyleToEmotionObject();
  const submitErrorMessageId = useUniqueId('webchat__send-box__error-message-id');
  const timeoutRef = useRef<readonly [Timeout, Timeout] | undefined>(undefined);

  const errorMessageStringMap = useMemo<ErrorMessageStringMap>(
    () =>
      Object.freeze(
        new Map<SendError, string>()
          .set('empty', localize('SEND_BOX_IS_EMPTY_TOOLTIP_ALT'))
          // TODO: [P0] We should add a new string for "Cannot send message while offline."
          .set('offline', localize('CONNECTIVITY_STATUS_ALT_FATAL'))
      ),
    [localize]
  );
  const focusRef = useRefFrom(focus);
  const scrollToEndRef = useRefFrom(scrollToEnd);
  const setErrorRef = useRef<typeof setError | undefined>(setError);
  const submitErrorMessageClassName = styleToEmotionObject(SUBMIT_ERROR_MESSAGE_STYLE) + '';
  const submitErrorMessageIdState = useMemo<readonly [string | undefined]>(
    () => Object.freeze([error ? submitErrorMessageId : undefined]) as readonly [string | undefined],
    [error, submitErrorMessageId]
  );

  setErrorRef.current = setError;

  const submitErrorRef = useRefFrom<'empty' | 'offline' | undefined>(
    connectivityStatus !== 'connected' && connectivityStatus !== 'reconnected'
      ? 'offline'
      : !sendBoxValue
      ? 'empty'
      : undefined
  );

  const submit = useCallback<ContextType['submit']>(
    ({ setFocus } = {}) => {
      (setFocus === 'main' || setFocus === 'sendBox' || setFocus === 'sendBoxWithoutKeyboard') &&
        focusRef.current?.(setFocus === 'main' || setFocus === 'sendBox' ? setFocus : 'sendBoxWithoutKeyboard');

      const { current: submitError } = submitErrorRef;

      if (submitError) {
        timeoutRef.current && timeoutRef.current.forEach(clearTimeout);

        setErrorRef.current?.(false);

        timeoutRef.current = Object.freeze([
          setTimeout(() => setErrorRef.current?.(submitError), TIME_TO_RESET_ERROR_MESSAGE),
          setTimeout(() => setErrorRef.current?.(false), TIME_TO_QUEUE_ERROR_MESSAGE)
        ]) as readonly [Timeout, Timeout];
      } else {
        scrollToEndRef.current?.();
        apiSubmitSendBox();
      }
    },
    [apiSubmitSendBox, clearTimeout, focusRef, scrollToEndRef, setErrorRef, setTimeout, submitErrorRef, timeoutRef]
  );

  useEffect(
    // Prevent `setTimeout()` from firing after unmount.
    () => () => {
      setErrorRef.current = undefined;
    },
    [setErrorRef]
  );

  const context = useMemo(
    () => ({
      submit,
      submitErrorMessageIdState
    }),
    [submit, submitErrorMessageIdState]
  );

  return (
    <SendBoxContext.Provider value={context}>
      {children}
      <span
        className={classNames('webchat__submit-error-message', submitErrorMessageClassName)}
        // "id" is required for "aria-errormessage" as IDREF.
        // eslint-disable-next-line react/forbid-dom-props
        id={submitErrorMessageId}
        role="alert"
      >
        {error ? errorMessageStringMap.get(error) : ''}
      </span>
    </SendBoxContext.Provider>
  );
};

export default SendBoxComposer;
