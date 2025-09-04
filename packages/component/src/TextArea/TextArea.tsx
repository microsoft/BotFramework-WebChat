import { hooks } from 'botframework-webchat-api';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, {
  forwardRef,
  Fragment,
  useCallback,
  useRef,
  type FormEventHandler,
  type KeyboardEventHandler,
  type ReactNode
} from 'react';

import styles from './TextArea.module.css';

const { useUIState } = hooks;

const TextArea = forwardRef<
  HTMLTextAreaElement,
  Readonly<{
    'aria-describedby'?: string | undefined;
    'aria-labelledby'?: string | undefined;
    className?: string | undefined;
    completion?: ReactNode | undefined;
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
  const isInCompositionRef = useRef<boolean>(false);

  const disabled = uiState === 'disabled';

  const handleCompositionEnd = useCallback(() => {
    isInCompositionRef.current = false;
  }, [isInCompositionRef]);

  const handleCompositionStart = useCallback(() => {
    isInCompositionRef.current = true;
  }, [isInCompositionRef]);

  const handleKeyDown = useCallback<KeyboardEventHandler<HTMLTextAreaElement>>(event => {
    // Shift+Enter adds a new line
    // Enter requests related form submission
    if (!event.shiftKey && event.key === 'Enter' && !isInCompositionRef.current) {
      event.preventDefault();

      if ('form' in event.target && event.target.form instanceof HTMLFormElement) {
        event.target?.form?.requestSubmit();
      }
    }
  }, []);

  return (
    <div
      className={cx(
        classNames['text-area'],
        classNames['text-area--scroll'],
        { [classNames['text-area--hidden']]: props.hidden },
        { [classNames['text-area--in-completion']]: props.completion },
        props.className
      )}
      role={props.hidden ? 'hidden' : undefined}
    >
      {uiState === 'blueprint' ? (
        <div className={cx(classNames['text-area-doppelganger'], classNames['text-area-shared'])}> </div>
      ) : (
        <Fragment>
          <div className={cx(classNames['text-area-doppelganger'], classNames['text-area-shared'])}>
            {props.completion ? props.completion : props.value}{' '}
          </div>
          <textarea
            aria-describedby={props['aria-describedby']}
            aria-disabled={disabled}
            aria-labelledby={props['aria-labelledby']}
            aria-placeholder={props.placeholder}
            className={cx(classNames['text-area-input'], classNames['text-area-shared'])}
            data-testid={props['data-testid']}
            onCompositionEnd={handleCompositionEnd}
            onCompositionStart={handleCompositionStart}
            onInput={props.onInput}
            onKeyDown={handleKeyDown}
            placeholder={props.placeholder}
            readOnly={disabled}
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
