/* eslint no-magic-numbers: ["error", { "ignore": [-1] }] */

import PropTypes from 'prop-types';
import React, {
  ChangeEventHandler,
  FocusEventHandler,
  forwardRef,
  KeyboardEventHandler,
  ReactEventHandler,
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

type AccessibleInputTextProps = {
  className?: string;
  disabled?: boolean;
  enterKeyHint?: string;
  inputMode?: 'text' | 'none' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  onKeyDownCapture?: KeyboardEventHandler<HTMLInputElement>;
  onKeyPress?: KeyboardEventHandler<HTMLInputElement>;
  onSelect?: ReactEventHandler<HTMLInputElement>;
  placeholder?: string;
  readOnly?: boolean;
  tabIndex?: number;
  type: 'text';
  value?: string;
};

const AccessibleInputText = forwardRef<HTMLInputElement, AccessibleInputTextProps>(
  (
    {
      className,
      disabled,
      enterKeyHint,
      onChange,
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
        className={className}
        onChange={disabled ? undefined : onChange}
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

AccessibleInputText.defaultProps = {
  className: undefined,
  disabled: undefined,
  enterKeyHint: undefined,
  inputMode: undefined,
  onChange: undefined,
  onFocus: undefined,
  onKeyDown: undefined,
  onKeyDownCapture: undefined,
  onKeyPress: undefined,
  onSelect: undefined,
  placeholder: undefined,
  readOnly: undefined,
  tabIndex: undefined,
  value: undefined
};

AccessibleInputText.displayName = 'AccessibleInputText';

AccessibleInputText.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  enterKeyHint: PropTypes.string,
  inputMode: PropTypes.oneOf(['text', 'none', 'tel', 'url', 'email', 'numeric', 'decimal', 'search']),
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onKeyDown: PropTypes.func,
  onKeyDownCapture: PropTypes.func,
  onKeyPress: PropTypes.func,
  onSelect: PropTypes.func,
  placeholder: PropTypes.string,
  readOnly: PropTypes.bool,
  tabIndex: PropTypes.number,
  // @ts-ignore PropTypes and TypeScript type do not well understood each other.
  type: PropTypes.oneOf(['text']).isRequired,
  value: PropTypes.string
};

export default AccessibleInputText;
