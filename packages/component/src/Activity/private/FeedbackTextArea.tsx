import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { forwardRef, Fragment, useCallback, type ChangeEventHandler, type KeyboardEventHandler } from 'react';
import useStyleSet from '../../hooks/useStyleSet';

const { useUIState } = hooks;

const TextArea = forwardRef<
  HTMLTextAreaElement,
  Readonly<{
    'aria-label'?: string | undefined;
    className?: string | undefined;
    'data-testid'?: string | undefined;

    /**
     * `true`, if the text area should be hidden but stay in the DOM, otherwise, `false`.
     *
     * Keeping the element in the DOM while making it invisible to users and PWDs is useful in these scenarios:
     *
     * - When the DTMF keypad is going away, we need to send focus to the text area before we unmount DTMF keypad,
     *   This ensures the flow of focus did not sent to document body
     */
    hidden?: boolean | undefined;
    onChange?: ChangeEventHandler<HTMLTextAreaElement> | undefined;
    placeholder?: string | undefined;
    startRows?: number | undefined;
    value?: string | undefined;
  }>
>((props, ref) => {
  const [uiState] = useUIState();
  const [{ feedbackTextArea }] = useStyleSet();

  const disabled = uiState === 'disabled';

  const handleKeyDown = useCallback<KeyboardEventHandler<HTMLTextAreaElement>>(event => {
    // Shift+Enter adds a new line
    // Enter requests related form submission
    if (!event.shiftKey && event.key === 'Enter') {
      event.preventDefault();

      if ('form' in event.target && event.target.form instanceof HTMLFormElement) {
        event.target?.form?.requestSubmit();
      }
    }
  }, []);

  return (
    <div
      className={classNames(
        'webchat__feedback-form-text-area',
        { 'webchat__feedback-form-text-area--hidden': props.hidden },
        feedbackTextArea + ''
      )}
      role={props.hidden ? 'hidden' : undefined}
    >
      {uiState === 'blueprint' ? (
        <div
          className={classNames(
            'webchat__feedback-form-text-area-doppelganger',
            'webchat__feedback-form-text-area-input--scroll',
            'webchat__feedback-form-text-area-shared',
            feedbackTextArea + ''
          )}
        >
          {' '}
        </div>
      ) : (
        <Fragment>
          <div
            className={classNames(
              'webchat__feedback-form-text-area-doppelganger',
              'webchat__feedback-form-text-area-input--scroll',
              'webchat__feedback-form-text-area-shared',
              feedbackTextArea + ''
            )}
          >
            {props.value || props.placeholder}{' '}
          </div>
          <textarea
            aria-disabled={disabled}
            aria-label={props['aria-label']}
            className={classNames(
              'webchat__feedback-form-text-area-input',
              'webchat__feedback-form-text-area-input--scroll',
              'webchat__feedback-form-text-area-shared',
              feedbackTextArea + ''
            )}
            data-testid={props['data-testid']}
            onChange={props.onChange}
            onKeyDown={handleKeyDown}
            placeholder={props.placeholder}
            readOnly={disabled}
            ref={ref}
            rows={props.startRows ?? 1}
            // eslint-disable-next-line no-magic-numbers
            tabIndex={props.hidden || disabled ? -1 : undefined}
            value={props.value}
          />
        </Fragment>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;
