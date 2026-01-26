/* eslint no-magic-numbers: ["error", { "ignore": [-1] }] */

import React, {
  type ChangeEventHandler,
  type FocusEventHandler,
  forwardRef,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactEventHandler,
  useRef
} from 'react';

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

type AccessibleInputTextProps = Readonly<{
  'aria-errormessage'?: string;
  className?: string | undefined;
  'data-id'?: string | undefined;
  'data-testid'?: string | undefined;
  disabled?: boolean | undefined;
  enterKeyHint?: string | undefined;
  inputMode?: 'text' | 'none' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search' | undefined;
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
  onClick?: MouseEventHandler<HTMLInputElement> | undefined;
  onFocus?: FocusEventHandler<HTMLInputElement> | undefined;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement> | undefined;
  onKeyDownCapture?: KeyboardEventHandler<HTMLInputElement> | undefined;
  onKeyPress?: KeyboardEventHandler<HTMLInputElement> | undefined;
  onSelect?: ReactEventHandler<HTMLInputElement> | undefined;
  placeholder?: string | undefined;
  readOnly?: boolean | undefined;
  tabIndex?: number | undefined;
  type: 'text';
  value?: string | undefined;
}>;

const AccessibleInputText = forwardRef<HTMLInputElement, AccessibleInputTextProps>(
  (
    {
      'aria-errormessage': ariaErrorMessage,
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
    },
    forwardedRef
  ) => {
    const targetRef = useRef();

    const ref = forwardedRef || targetRef;

    useEnterKeyHint(ref, enterKeyHint);

    return (
      <input
        aria-disabled={disabled || undefined}
        aria-errormessage={ariaErrorMessage}
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
  }
);

AccessibleInputText.displayName = 'AccessibleInputText';

export default AccessibleInputText;
