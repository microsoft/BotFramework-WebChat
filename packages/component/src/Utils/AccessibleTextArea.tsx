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

// Differences between <textarea> and <AccessibleTextArea>:
// - Disable behavior
//   - When the widget is disabled
//     - Set "aria-disabled" attribute to "true"
//     - Set "readonly" attribute
//     - Set "tabIndex" to -1
//     - Remove "onChange" handler
//   - Why this is needed
//     - Browser compatibility: when the widget is disabled, different browser send focus to different places
//     - When the widget is disabled, it's reasonable to keep the focus on the same widget for an extended period of time
//       - When the user presses TAB after the current widget is disabled, it should move the focus to the next non-disabled widget

// Developers using this accessible widget will need to:
// - Style the disabled widget themselves using CSS query `:disabled, [aria-disabled="true"] {}`
// - Modify all the code that checks disabled through the "disabled" attribute to use aria-disabled="true" instead
//   - aria-disabled="true" is the source of truth
// - If the widget is contained by a <form>, the developer need to filter out some `onSubmit` event caused by this widget

type AccessibleTextAreaProps = {
  className?: string;
  disabled?: boolean;
  inputMode?: 'text' | 'none' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  onFocus?: FocusEventHandler<HTMLTextAreaElement>;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;
  onKeyDownCapture?: KeyboardEventHandler<HTMLTextAreaElement>;
  onKeyPress?: KeyboardEventHandler<HTMLTextAreaElement>;
  onSelect?: ReactEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
  tabIndex?: number;
  value?: string;
};

const AccessibleTextArea = forwardRef<HTMLTextAreaElement, AccessibleTextAreaProps>(
  (
    {
      className,
      disabled,
      inputMode,
      onChange,
      onFocus,
      onKeyDown,
      onKeyDownCapture,
      onKeyPress,
      onSelect,
      placeholder,
      readOnly,
      rows,
      tabIndex,
      ...props
    },
    forwardedRef
  ) => {
    const targetRef = useRef();

    const ref = forwardedRef || targetRef;

    return (
      <textarea
        aria-disabled={disabled || undefined}
        className={className}
        inputMode={inputMode}
        onChange={disabled ? undefined : onChange}
        onFocus={disabled ? undefined : onFocus}
        onKeyDown={disabled ? undefined : onKeyDown}
        onKeyDownCapture={disabled ? undefined : onKeyDownCapture}
        onKeyPress={disabled ? undefined : onKeyPress}
        onSelect={disabled ? undefined : onSelect}
        placeholder={placeholder}
        readOnly={readOnly || disabled}
        ref={ref}
        rows={rows}
        tabIndex={disabled ? -1 : tabIndex}
        {...props}
      />
    );
  }
);

AccessibleTextArea.defaultProps = {
  className: undefined,
  disabled: undefined,
  inputMode: undefined,
  onChange: undefined,
  onFocus: undefined,
  onKeyDown: undefined,
  onKeyDownCapture: undefined,
  onKeyPress: undefined,
  onSelect: undefined,
  placeholder: undefined,
  readOnly: undefined,
  rows: undefined,
  tabIndex: undefined,
  value: undefined
};

AccessibleTextArea.displayName = 'AccessibleTextArea';

AccessibleTextArea.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  inputMode: PropTypes.oneOf(['text', 'none', 'tel', 'url', 'email', 'numeric', 'decimal', 'search']),
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onKeyDown: PropTypes.func,
  onKeyDownCapture: PropTypes.func,
  onKeyPress: PropTypes.func,
  onSelect: PropTypes.func,
  placeholder: PropTypes.string,
  readOnly: PropTypes.bool,
  rows: PropTypes.number,
  tabIndex: PropTypes.number,
  value: PropTypes.string
};

export default AccessibleTextArea;
