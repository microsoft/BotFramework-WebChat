import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React, { forwardRef, Fragment, useCallback, type FormEventHandler, type KeyboardEventHandler } from 'react';
import { useStyles } from '../../styles';
import styles from './TextArea.module.css';

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
    onInput?: FormEventHandler<HTMLTextAreaElement> | undefined;
    placeholder?: string | undefined;
    startRows?: number | undefined;
    value?: string | undefined;
  }>
>((props, ref) => {
  const [uiState] = useUIState();
  const classNames = useStyles(styles);

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
      className={cx(
        classNames['sendbox__text-area'],
        { [classNames['sendbox__text-area--hidden']]: props.hidden },
        props.className
      )}
      role={props.hidden ? 'hidden' : undefined}
    >
      {uiState === 'mock' ? (
        <div
          className={cx(
            classNames['sendbox__text-area-doppelganger'],
            classNames['sendbox__text-area-input--scroll'],
            classNames['sendbox__text-area-shared']
          )}
        >
          {' '}
        </div>
      ) : (
        <Fragment>
          <div
            className={cx(
              classNames['sendbox__text-area-doppelganger'],
              classNames['sendbox__text-area-input--scroll'],
              classNames['sendbox__text-area-shared']
            )}
          >
            {props.value || props.placeholder}{' '}
          </div>
          <textarea
            aria-label={props['aria-label']}
            className={cx(
              classNames['sendbox__text-area-input'],
              classNames['sendbox__text-area-input--scroll'],
              classNames['sendbox__text-area-shared']
            )}
            data-testid={props['data-testid']}
            onInput={props.onInput}
            onKeyDown={handleKeyDown}
            placeholder={props.placeholder}
            ref={ref}
            rows={props.startRows ?? 1}
            // eslint-disable-next-line no-magic-numbers
            tabIndex={props.hidden ? -1 : undefined}
            value={props.value}
          />
        </Fragment>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;
