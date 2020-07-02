/* eslint no-magic-numbers: ["error", { "ignore": [-1] }] */

import PropTypes from 'prop-types';
import React, { forwardRef, useRef } from 'react';

const PREVENT_DEFAULT_HANDLER = event => event.preventDefault();

// Differences between <button> and <AccessibleButton>:
// - Disable behavior
//   - When the widget is disabled
//     - Set "aria-disabled" attribute to "true"
//     - Set "readonly" attribute
//     - Set "tabIndex" to -1
//     - Remove "onClick" handler
//   - Why this is needed
//     - Browser compatibility: when the widget is disabled, different browser send focus to different places
//     - When the widget become disabled, it's reasonable to keep the focus on the same widget for an extended period of time
//       - When the user presses TAB after the current widget is disabled, it should jump to the next non-disabled widget

// Developers using this accessible widget will need to:
// - Style the disabled widget themselves, using CSS query `:disabled, [aria-disabled="true"] {}`
// - Modify all code that check disabled through "disabled" attribute to use aria-disabled="true" instead
//   - aria-disabled="true" is the source of truth
// - If the widget is contained by a <form>, the developer need to filter out some `onSubmit` event caused by this widget

const AccessibleButton = forwardRef(({ disabled, onClick, tabIndex, ...props }, forwardedRef) => {
  const targetRef = useRef();

  const ref = forwardedRef || targetRef;

  return (
    <button
      aria-disabled={disabled || undefined}
      onClick={disabled ? PREVENT_DEFAULT_HANDLER : onClick}
      ref={ref}
      tabIndex={disabled ? -1 : tabIndex}
      {...props}
      type="button"
    />
  );
});

AccessibleButton.defaultProps = {
  disabled: undefined,
  onClick: undefined,
  tabIndex: undefined
};

AccessibleButton.displayName = 'AccessibleButton';

AccessibleButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  tabIndex: PropTypes.number,
  type: PropTypes.oneOf(['button']).isRequired
};

export default AccessibleButton;
