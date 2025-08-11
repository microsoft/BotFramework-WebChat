/* eslint no-magic-numbers: ["error", { "ignore": [-1] }] */

import { reactNode } from '@msinternal/botframework-webchat-react-valibot';
import React, { forwardRef, memo, type MouseEventHandler } from 'react';
import {
  boolean,
  custom,
  function_,
  literal,
  number,
  object,
  optional,
  pipe,
  readonly,
  safeParse,
  string,
  type InferInput
} from 'valibot';

const PREVENT_DEFAULT_HANDLER = event => event.preventDefault();

const accessibleButtonPropsSchema = pipe(
  object({
    'aria-hidden': optional(boolean()),
    'aria-keyshortcuts': optional(string()),
    children: optional(reactNode()),
    className: optional(string()),
    'data-testid': optional(string()),
    disabled: optional(boolean()),
    onClick: custom<MouseEventHandler<HTMLButtonElement>>(value => safeParse(function_(), value).success),
    tabIndex: optional(number()),
    title: optional(string()),
    type: literal('button')
  }),
  readonly()
);

type AccessibleButtonProps = InferInput<typeof accessibleButtonPropsSchema>;

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
  (
    {
      'aria-hidden': ariaHidden,
      'aria-keyshortcuts': ariaKeyShortcuts,
      children,
      className,
      'data-testid': dataTestId,
      disabled,
      onClick,
      tabIndex,
      title
    },
    ref
  ) => (
    <button
      aria-disabled={disabled || undefined}
      aria-hidden={ariaHidden}
      aria-keyshortcuts={ariaKeyShortcuts}
      className={className}
      data-testid={dataTestId}
      onClick={disabled ? PREVENT_DEFAULT_HANDLER : onClick}
      ref={ref}
      tabIndex={disabled ? -1 : tabIndex}
      title={title}
      type="button"
    >
      {children}
    </button>
  )
);

AccessibleButton.displayName = 'AccessibleButton';

export default memo(AccessibleButton);
export { accessibleButtonPropsSchema, type AccessibleButtonProps };
