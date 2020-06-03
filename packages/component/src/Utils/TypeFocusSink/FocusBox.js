// This is for defaultProps: { children: undefined }
/* eslint no-undefined: "off" */

import PropTypes from 'prop-types';
import React, { forwardRef, useCallback, useMemo, useRef } from 'react';

import Context from './Context';
import getTabIndex from './getTabIndex';
import inputtableKey from './inputtableKey';

const DEFAULT_STYLE = { outline: 0 };

const BaseFocusBox = ({ children, disabled, sendFocusRef: sendFocusRefProp, ...otherProps }, ref) => {
  const sendFocusRefPersist = useRef(null);
  const patchedSendFocusRef = useMemo(() => sendFocusRefProp || sendFocusRefPersist, [
    sendFocusRefPersist,
    sendFocusRefProp
  ]);

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
    [focus]
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

FocusBox.defaultProps = BaseFocusBox.defaultProps = {
  children: undefined,
  disabled: false
};

FocusBox.propTypes = BaseFocusBox.propTypes = {
  children: PropTypes.any,
  disabled: PropTypes.bool,
  sendFocusRef: PropTypes.shape({
    current: PropTypes.shape({
      focus: PropTypes.func
    })
  }).isRequired
};

export default FocusBox;
