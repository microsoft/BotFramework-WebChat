import React, { MouseEventHandler, ReactNode, forwardRef, memo, useRef } from 'react';

const preventDefaultHandler: MouseEventHandler<HTMLButtonElement> = event => event.preventDefault();

type AccessibleButtonProps = Readonly<{
  className?: string | undefined;
  'aria-hidden'?: boolean;
  children?: ReactNode;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  tabIndex?: number;
  type: 'button';
}>;

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
    const targetRef = useRef<HTMLButtonElement>(null);

    const ref = forwardedRef || targetRef;

    return (
      <button
        aria-disabled={disabled ? 'true' : 'false'}
        aria-hidden={ariaHidden}
        onClick={disabled ? preventDefaultHandler : onClick}
        ref={ref}
        tabIndex={tabIndex}
        {...(disabled && {
          'aria-disabled': 'true',
          tabIndex: -1
        })}
        {...props}
        type="button"
      >
        {children}
      </button>
    );
  }
);

export default memo(AccessibleButton);
