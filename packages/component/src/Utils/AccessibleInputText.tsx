/* eslint no-magic-numbers: ["error", { "ignore": [-1] }] */

import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, {
  type ChangeEventHandler,
  type FocusEventHandler,
  forwardRef,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactEventHandler,
  useRef
} from 'react';
import {
  boolean,
  custom,
  type InferInput,
  literal,
  number,
  object,
  optional,
  picklist,
  pipe,
  readonly,
  string
} from 'valibot';

import useEnterKeyHint from '../hooks/internal/useEnterKeyHint';

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

const AccessibleInputTextPropsSchema = pipe(
  object({
    'aria-errormessage': optional(string()),
    'aria-label': optional(string()),
    className: optional(string()),
    'data-id': optional(string()),
    'data-testid': optional(string()),
    disabled: optional(boolean()),
    enterKeyHint: optional(string()),
    inputMode: optional(picklist(['decimal', 'email', 'none', 'numeric', 'search', 'tel', 'text', 'url'])),
    onChange: optional(custom<ChangeEventHandler<HTMLInputElement>>(value => typeof value === 'function')),
    onClick: optional(custom<MouseEventHandler<HTMLInputElement>>(value => typeof value === 'function')),
    onFocus: optional(custom<FocusEventHandler<HTMLInputElement>>(value => typeof value === 'function')),
    onKeyDown: optional(custom<KeyboardEventHandler<HTMLInputElement>>(value => typeof value === 'function')),
    onKeyDownCapture: optional(custom<KeyboardEventHandler<HTMLInputElement>>(value => typeof value === 'function')),
    onKeyPress: optional(custom<KeyboardEventHandler<HTMLInputElement>>(value => typeof value === 'function')),
    onSelect: optional(custom<ReactEventHandler<HTMLInputElement>>(value => typeof value === 'function')),
    placeholder: optional(string()),
    readOnly: optional(boolean()),
    tabIndex: optional(number()),
    type: literal('text'),
    value: optional(string())
  }),
  readonly()
);

type AccessibleInputTextProps = InferInput<typeof AccessibleInputTextPropsSchema>;

const AccessibleInputText = forwardRef<HTMLInputElement, AccessibleInputTextProps>((rawProps, forwardedRef) => {
  const {
    'aria-errormessage': ariaErrorMessage,
    'aria-label': ariaLabel,
    className,
    'data-id': dataId,
    'data-testid': dataTestId,
    disabled,
    enterKeyHint,
    onChange,
    onClick,
    onFocus,
    onKeyDown,
    onKeyDownCapture,
    onKeyPress,
    onSelect,
    placeholder,
    readOnly,
    tabIndex,
    value,
    ...props
  } = validateProps(AccessibleInputTextPropsSchema, rawProps);

  const targetRef = useRef<HTMLInputElement>(null);

  const ref = forwardedRef || targetRef;

  useEnterKeyHint(ref, enterKeyHint);

  return (
    <input
      aria-disabled={disabled || undefined}
      aria-errormessage={ariaErrorMessage}
      aria-label={ariaLabel}
      className={className}
      data-id={dataId}
      data-testid={dataTestId}
      onChange={disabled ? undefined : onChange}
      onClick={onClick}
      onFocus={disabled ? undefined : onFocus}
      onKeyDown={disabled ? undefined : onKeyDown}
      onKeyDownCapture={disabled ? undefined : onKeyDownCapture}
      onKeyPress={disabled ? undefined : onKeyPress}
      onSelect={disabled ? undefined : onSelect}
      placeholder={placeholder}
      readOnly={readOnly || disabled}
      ref={ref}
      tabIndex={disabled ? -1 : tabIndex}
      value={value}
      {...props}
      type="text"
    />
  );
});

AccessibleInputText.displayName = 'AccessibleInputText';

export default AccessibleInputText;
export { AccessibleInputTextPropsSchema, type AccessibleInputTextProps };
