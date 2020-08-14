/* eslint no-magic-numbers: ["error", { "ignore": [-1] }] */

import PropTypes from 'prop-types';
import React, { forwardRef, useRef } from 'react';

// Differences between <input type="text"> and <AccessibleInputText>:
// - Disable behavior
//   - When the widget is disabled
//     - Set "aria-disabled" attribute to "true"
//     - Set "readonly" attribute
//     - Set "tabIndex" to -1
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

const AccessibleInputText = forwardRef(
  ({ disabled, onChange, onFocus, onKeyDown, onKeyPress, onSelect, tabIndex, ...props }, forwardedRef) => {
    const targetRef = useRef();

    const ref = forwardedRef || targetRef;

    return (
      <input
        aria-disabled={disabled || undefined}
        onChange={disabled ? undefined : onChange}
        onFocus={disabled ? undefined : onFocus}
        onKeyDown={disabled ? undefined : onKeyDown}
        onKeyPress={disabled ? undefined : onKeyPress}
        onSelect={disabled ? undefined : onSelect}
        readOnly={disabled}
        ref={ref}
        tabIndex={disabled ? -1 : tabIndex}
        {...props}
        type="text"
      />
    );
  }
);

AccessibleInputText.defaultProps = {
  disabled: undefined,
  onChange: undefined,
  onFocus: undefined,
  onKeyDown: undefined,
  onKeyPress: undefined,
  onSelect: undefined,
  tabIndex: undefined
};

AccessibleInputText.displayName = 'AccessibleInputText';

AccessibleInputText.propTypes = {
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onKeyDown: PropTypes.func,
  onKeyPress: PropTypes.func,
  onSelect: PropTypes.func,
  tabIndex: PropTypes.number,
  type: PropTypes.oneOf(['text']).isRequired
};

export default AccessibleInputText;
