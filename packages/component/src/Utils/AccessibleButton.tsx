/* eslint no-magic-numbers: ["error", { "ignore": [-1] }] */

import PropTypes from 'prop-types';
import React, { forwardRef, MouseEventHandler, ReactNode, useRef } from 'react';

const PREVENT_DEFAULT_HANDLER = event => event.preventDefault();

type AccessibleButtonProps = {
  'aria-hidden'?: boolean;
  children?: ReactNode;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  tabIndex?: number;
  type: 'button';
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

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

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 'aria-hidden': ariaHidden, children, disabled, onClick, tabIndex, ...props }, forwardedRef) => {
    const targetRef = useRef();

    const ref = forwardedRef || targetRef;

    return (
      <button
        aria-disabled={disabled || undefined}
        aria-hidden={ariaHidden}
        onClick={disabled ? PREVENT_DEFAULT_HANDLER : onClick}
        ref={ref}
        tabIndex={disabled ? -1 : tabIndex}
        {...props}
        type="button"
      >
        {children}
      </button>
    );
  }
);

AccessibleButton.defaultProps = {
  'aria-hidden': undefined,
  children: undefined,
  disabled: undefined,
  onClick: undefined,
  tabIndex: undefined
};

AccessibleButton.displayName = 'AccessibleButton';

AccessibleButton.propTypes = {
  'aria-hidden': PropTypes.bool,
  children: PropTypes.any,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  tabIndex: PropTypes.number,
  // TypeScript class is not mappable to PropTypes.oneOf(['button'])
  // @ts-ignore
  type: PropTypes.oneOf(['button']).isRequired
};

export default AccessibleButton;
