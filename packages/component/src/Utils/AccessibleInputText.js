import PropTypes from 'prop-types';
import React, { forwardRef, useRef } from 'react';

import useDisableOnBlurEffect from '../hooks/internal/useDisableOnBlurEffect';

// Differences between <textarea> and <AccessibleTextArea>:
// - When the widget is disabled:
//   - Set "aria-disabled" attribute to "true"
//   - Set "readonly" attribute
//   - If the focus is on, don't set "disabled" attribute, until it is blurred
//     - Otherwise, set "disabled" attribute
//   - Remove "onChange" handler

// Developers using this accessible widget will need to:
// - Style the disabled widget themselves, using CSS query `:disabled, [aria-disabled="true"] {}`
// - If the widget is contained by a <form>, the developer need to filter out some `onSubmit` event caused by this widget

const AccessibleInputText = forwardRef(({ disabled, onChange, ...props }, forwardedRef) => {
  const targetRef = useRef();

  const ref = forwardedRef || targetRef;

  useDisableOnBlurEffect(ref, disabled);

  return (
    <input
      aria-disabled={disabled || undefined}
      onChange={disabled ? undefined : onChange}
      readOnly={disabled}
      ref={ref}
      {...props}
      type="text"
    />
  );
});

AccessibleInputText.defaultProps = {
  disabled: undefined,
  onChange: undefined
};

AccessibleInputText.propTypes = {
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  type: PropTypes.oneOf(['text']).isRequired
};

export default AccessibleInputText;
