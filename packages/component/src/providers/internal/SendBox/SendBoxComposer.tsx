import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { memo, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRefFrom } from 'use-ref-from';

import { useStyleToEmotionObject } from '../../../hooks/internal/styleToEmotionObject';
import useUniqueId from '../../../hooks/internal/useUniqueId';
import useFocus from '../../../hooks/useFocus';
import useScrollToEnd from '../../../hooks/useScrollToEnd';
import { useLiveRegion } from '../../../providers/LiveRegionTwin';
import SendBoxContext from './private/Context';
import { type ContextType, type SendError } from './private/types';

const { useConnectivityStatus, useLocalizer, useSendBoxAttachments, useSendBoxValue, useSubmitSendBox } = hooks;

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

type SendBoxComposerProps = Readonly<{ children?: ReactNode | undefined }>;

// TODO: [P2] Complete this component.
const SendBoxComposer = ({ children }: SendBoxComposerProps) => {
  const [attachments] = useSendBoxAttachments();
  const [connectivityStatus] = useConnectivityStatus();
  const [error, setError] = useState<SendError | false>(false);
  const [sendBoxValue] = useSendBoxValue();
  const apiSubmitSendBox = useSubmitSendBox();
  const focus = useFocus();
  const localize = useLocalizer();
  const scrollToEnd = useScrollToEnd();
  const styleToEmotionObject = useStyleToEmotionObject();
  const submitErrorMessageId = useUniqueId('webchat__send-box__error-message-id');

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
  const submitErrorMessageClassName = styleToEmotionObject(SUBMIT_ERROR_MESSAGE_STYLE) + '';
  const submitErrorMessageIdState = useMemo<readonly [string | undefined]>(
    () => Object.freeze([error ? submitErrorMessageId : undefined]) as readonly [string | undefined],
    [error, submitErrorMessageId]
  );

  const submitErrorRef = useRefFrom<'empty' | 'offline' | undefined>(
    connectivityStatus !== 'connected' && connectivityStatus !== 'reconnected'
      ? 'offline'
      : !sendBoxValue && !attachments.length
        ? 'empty'
        : undefined
  );

  const submit = useCallback<ContextType['submit']>(
    ({ setFocus } = {}) => {
      (setFocus === 'main' || setFocus === 'sendBox' || setFocus === 'sendBoxWithoutKeyboard') &&
        focusRef.current?.(setFocus === 'main' || setFocus === 'sendBox' ? setFocus : 'sendBoxWithoutKeyboard');

      const { current: submitError } = submitErrorRef;
      setError(submitError ?? false);

      if (!submitError) {
        scrollToEndRef.current?.();
        apiSubmitSendBox();
      }
    },
    [apiSubmitSendBox, focusRef, scrollToEndRef, submitErrorRef]
  );

  const context = useMemo(
    () => ({
      submit,
      submitErrorMessageIdState
    }),
    [submit, submitErrorMessageIdState]
  );

  const hasValue = !!sendBoxValue?.trim();

  useEffect(() => {
    if (error === 'empty' && hasValue) {
      // TODO: [P2] Intentionally set the state, we will visit it later.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(false);
    }
  }, [error, hasValue]);

  const errorMessage = error && errorMessageStringMap.get(error);

  useLiveRegion(
    () => errorMessage && <div className={classNames('webchat__submit-error-message__status')}>{errorMessage}</div>,
    [errorMessage]
  );

  return (
    <SendBoxContext.Provider value={context}>
      {children}
      <span
        className={classNames('webchat__submit-error-message', submitErrorMessageClassName)}
        // "id" is required for "aria-errormessage" as IDREF.
        // eslint-disable-next-line react/forbid-dom-props
        id={submitErrorMessageId}
      >
        {error ? errorMessageStringMap.get(error) : ''}
      </span>
    </SendBoxContext.Provider>
  );
};

SendBoxComposer.displayName = 'SendBoxComposer';

export default memo(SendBoxComposer);
