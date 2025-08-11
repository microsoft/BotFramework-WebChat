import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { useCallback } from 'react';
import {
  custom,
  function_,
  instance,
  nullable,
  object,
  optional,
  pipe,
  readonly,
  safeParse,
  string,
  type InferInput
} from 'valibot';

import mutableRefObject from '../types/internal/mutableRefObject';

// This is an element, when focused, will send the focus to the ref specified in "redirectRef".
// Although the focus is being redirected, browser will scroll this redirector element into view.

// Browser's "scrollIntoView()" call cannot be prevented through event.preventDefault() in both
// bubble and capture phase of "focus" event.

// When this focus redirector is put inside a scrollable container, you may want to resize or reposition
// it to prevent unintentional scroll done by the browser default behavior.

const focusRedirectorPropsSchema = pipe(
  object({
    className: optional(string()),
    onFocus: optional(custom<() => void>(value => safeParse(function_(), value).success)),
    redirectRef: optional(mutableRefObject(nullable(instance(HTMLElement))))
  }),
  readonly()
);

type FocusRedirectorProps = InferInput<typeof focusRedirectorPropsSchema>;

function FocusRedirector(props: FocusRedirectorProps) {
  const { className, onFocus, redirectRef } = validateProps(focusRedirectorPropsSchema, props);

  const handleFocus = useCallback(() => {
    redirectRef?.current?.focus();
    onFocus && onFocus();
  }, [onFocus, redirectRef]);

  // 2023-02-23: With NVDA 2022.1 and 2022.4, when in browse mode, up/down arrow keys no longer focus.
  //             We no longer need to set aria-hidden="true" to hide it from browse mode.
  // 2021-09-21: For NVDA, we should set aria-hidden="true".
  //             When using NVDA in browse mode, press up/down arrow keys will focus on this redirector.
  //             This redirector is designed to capture TAB only and should not react on browse mode.
  //             However, reacting with browse mode is currently okay. Just better to leave it alone.

  return <div className={className} onFocus={handleFocus} tabIndex={0} />;
}

export default FocusRedirector;
export { focusRedirectorPropsSchema, type FocusRedirectorProps };
