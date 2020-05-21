import PropTypes from 'prop-types';
import React, { forwardRef, useRef } from 'react';

import useDisableOnBlurEffect from '../hooks/internal/useDisableOnBlurEffect';

const PREVENT_DEFAULT_HANDLER = event => event.preventDefault();

// Differences between <textarea> and <AccessibleTextArea>:
// - When the widget is disabled:
//   - Set "aria-disabled" attribute to "true"
//   - If the focus is on, don't set "disabled" attribute, until it is blurred
//     - Otherwise, set "disabled" attribute
//   - Remove "onClick" handler

// Developers using this accessible widget will need to:
// - Style the disabled widget themselves, using CSS query `:disabled, [aria-disabled="true"] {}`
// - If the widget is contained by a <form>, the developer need to filter out some `onSubmit` event caused by this widget

const AccessibleButton = forwardRef(({ disabled, onClick, ...props }, forwardedRef) => {
  const targetRef = useRef();

  const ref = forwardedRef || targetRef;

  useDisableOnBlurEffect(ref, disabled);

  return (
    <button
      aria-disabled={disabled || undefined}
      onClick={disabled ? PREVENT_DEFAULT_HANDLER : onClick}
      ref={ref}
      {...props}
    />
  );
});

AccessibleButton.defaultProps = {
  disabled: undefined,
  onClick: undefined
};

AccessibleButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func
};

export default AccessibleButton;
