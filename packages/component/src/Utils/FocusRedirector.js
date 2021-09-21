import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

// This is an element, when focused, will send the focus to the ref specified in "redirectRef".
// Although the focus is being redirected, browser will scroll this redirector element into view.

// Browser's "scrollIntoView()" call cannot be prevented through event.preventDefault() in both
// bubble and capture phase of "focus" event.

// When this focus redirector is put inside a scrollable container, you may want to resize or reposition
// it to prevent unintentional scroll done by the browser default behavior.

const FocusRedirector = ({ className, onFocus, redirectRef }) => {
  const handleFocus = useCallback(() => {
    const { current } = redirectRef;

    current && current.focus();
    onFocus && onFocus();
  }, [onFocus, redirectRef]);

  // For NVDA, we should set aria-hidden="true".
  // When using NVDA in browse mode, press up/down arrow keys will focus on this redirector.
  // This redirector is designed to capture TAB only and should not react on browse mode.
  // However, reacting with browse mode is currently okay. Just better to leave it alone.
  return <div aria-hidden="true" className={className} onFocus={handleFocus} tabIndex={0} />;
};

FocusRedirector.defaultProps = {
  className: undefined,
  onFocus: undefined
};

FocusRedirector.propTypes = {
  className: PropTypes.string,
  onFocus: PropTypes.func,
  redirectRef: PropTypes.shape({
    current: PropTypes.any
  }).isRequired
};

export default FocusRedirector;
