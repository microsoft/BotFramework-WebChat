import classNames from 'classnames';
import React, {
  ChangeEventHandler,
  FocusEventHandler,
  forwardRef,
  KeyboardEventHandler,
  ReactEventHandler,
  type MouseEventHandler
} from 'react';

import AccessibleTextArea from '../Utils/AccessibleTextArea';
import useEnterKeyHint from '../hooks/internal/useEnterKeyHint';
import useStyleSet from '../hooks/useStyleSet';

type AutoResizeTextAreaProps = Readonly<{
  'aria-errormessage'?: string | undefined;
  'aria-label'?: string | undefined;
  className?: string | undefined;
  'data-id'?: string | undefined;
  'data-testid'?: string | undefined;
  disabled?: boolean | undefined;
  enterKeyHint?: string | undefined;
  inputMode?: 'text' | 'none' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search' | undefined;
  onChange?: ChangeEventHandler<HTMLTextAreaElement> | undefined;
  onClick?: MouseEventHandler<HTMLTextAreaElement> | undefined;
  onFocus?: FocusEventHandler<HTMLTextAreaElement> | undefined;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement> | undefined;
  onKeyDownCapture?: KeyboardEventHandler<HTMLTextAreaElement> | undefined;
  onKeyPress?: KeyboardEventHandler<HTMLTextAreaElement> | undefined;
  onSelect?: ReactEventHandler<HTMLTextAreaElement> | undefined;
  placeholder?: string | undefined;
  readOnly?: boolean | undefined;
  rows?: number | undefined;
  textAreaClassName?: string | undefined;
  value?: string | undefined;
}>;

const AutoResizeTextArea = forwardRef<HTMLTextAreaElement, AutoResizeTextAreaProps>(
  (
    {
      'aria-errormessage': ariaErrorMessage,
      'aria-label': ariaLabel,
      className,
      'data-id': dataId,
      'data-testid': dataTestId,
      disabled,
      enterKeyHint,
      inputMode,
      onChange,
      onClick,
      onFocus,
      onKeyDown,
      onKeyDownCapture,
      onKeyPress,
      onSelect,
      placeholder,
      readOnly,
      rows,
      textAreaClassName,
      value
    },
    ref
  ) => {
    const [{ autoResizeTextArea: autoResizeTextAreaStyleSet }] = useStyleSet();

    useEnterKeyHint(ref, enterKeyHint);

    return (
      <div className={classNames('webchat__auto-resize-textarea', autoResizeTextAreaStyleSet + '', className)}>
        {/* We need to add a space here, so blank lines will be counted in the doppelganger. */}
        <div aria-hidden={true} className="webchat__auto-resize-textarea__doppelganger">
          {value}&nbsp;
        </div>
        <AccessibleTextArea
          aria-errormessage={ariaErrorMessage}
          aria-label={ariaLabel}
          className={classNames('webchat__auto-resize-textarea__textarea', textAreaClassName)}
          data-id={dataId}
          data-testid={dataTestId}
          disabled={disabled}
          inputMode={inputMode}
          onChange={onChange}
          onClick={onClick}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          onKeyDownCapture={onKeyDownCapture}
          onKeyPress={onKeyPress}
          onSelect={onSelect}
          placeholder={placeholder}
          readOnly={readOnly}
          ref={ref}
          rows={rows}
          value={value}
        />
      </div>
    );
  }
);

export default AutoResizeTextArea;
