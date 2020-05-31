import PropTypes from 'prop-types';
import React, { forwardRef, useRef } from 'react';

import useDisableOnBlurEffect from '../hooks/internal/useDisableOnBlurEffect';

// Differences between <input type="text"> and <AccessibleInputText>:
// - Disable behavior
//   - When the widget is disabled
//     - Set "aria-disabled" attribute to "true"
//     - Set "readonly" attribute
//     - If the focus is on, don't set "disabled" attribute until it is blurred
//       - Otherwise, set "disabled" attribute to `true`
//     - Remove "onChange" handler
//   - Why this is needed
//     - Browser compatibility: when the widget is disabled, different browser send focus to different places
//     - When the widget is disabled, it's reasonable to keep the focus on the same widget for an extended period of time
//       - When the user presses TAB after the current widget is disabled, it should jump to the next non-disabled widget

// Developers using this accessible widget will need to:
// - Style the disabled widget themselves, using CSS query `:disabled, [aria-disabled="true"] {}`
// - Modify all the code that checks disabled through the "disabled" attribute to use aria-disabled="true" instead
//   - aria-disabled="true" is the source of truth
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

AccessibleInputText.displayName = 'AccessibleInputText';

AccessibleInputText.propTypes = {
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  type: PropTypes.oneOf(['text']).isRequired
};

export default AccessibleInputText;
