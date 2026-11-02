/* eslint no-undefined: "off" */

import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { forwardRef, useCallback, useMemo, useRef } from 'react';
import { boolean, function_, nullish, object, pipe, readonly } from 'valibot';

import Context from './Context';
import getTabIndex from './getTabIndex';
import inputtableKey from './inputtableKey';

const DEFAULT_STYLE = { outline: 0 };

const focusBoxPropsSchema = pipe(
  object({
    children: nullish(reactNode()),
    disabled: nullish(boolean()),
    onKeyDownCapture: nullish(function_()),
    sendFocusRef: pipe(
      object({
        current: nullish(pipe(object({ focus: nullish(function_()) }), readonly()))
      }),
      readonly()
    )
  }),
  readonly()
);

const BaseFocusBox = (props, ref) => {
  const {
    children,
    disabled = false,
    onKeyDownCapture,
    sendFocusRef: sendFocusRefProp,
    ...otherProps
  } = validateProps(focusBoxPropsSchema, props);

  const sendFocusRefPersist = useRef(null);
  const patchedSendFocusRef = useMemo(
    () => sendFocusRefProp || sendFocusRefPersist,
    [sendFocusRefPersist, sendFocusRefProp]
  );

  const context = useMemo(
    () => ({
      sendFocusRef: patchedSendFocusRef
    }),
    [patchedSendFocusRef]
  );

  const focus = useCallback(() => {
    const { current } = patchedSendFocusRef;

    current && current.focus();
  }, [patchedSendFocusRef]);

  const handleKeyDownCapture = useCallback(
    event => {
      onKeyDownCapture && onKeyDownCapture(event);

      const { altKey, ctrlKey, key, metaKey, target } = event;
      const tabIndex = getTabIndex(target);

      if (altKey || (ctrlKey && key !== 'v') || metaKey || (!inputtableKey(key) && key !== 'Backspace')) {
        // Ignore if one of the utility key (except SHIFT) is pressed
        // E.g. CTRL-C on a link in one of the message should not jump to chat box
        // E.g. "A" or "Backspace" should jump to chat box
        return;
      }

      if (typeof tabIndex !== 'number' || tabIndex < 0 || target.getAttribute('aria-disabled') === 'true') {
        event.stopPropagation();

        focus();
      }
    },
    [focus, onKeyDownCapture]
  );

  return (
    <Context.Provider value={context}>
      <div
        {...otherProps}
        onKeyDownCapture={disabled ? undefined : handleKeyDownCapture}
        ref={ref}
        style={DEFAULT_STYLE}
        tabIndex={-1}
      >
        {typeof children === 'function' ? children({ focus }) : children}
      </div>
    </Context.Provider>
  );
};

const FocusBox = forwardRef(BaseFocusBox);

export default FocusBox;
