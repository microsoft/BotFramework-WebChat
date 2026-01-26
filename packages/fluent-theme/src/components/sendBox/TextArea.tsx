import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React, {
  forwardRef,
  Fragment,
  useCallback,
  useRef,
  type FormEventHandler,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode
} from 'react';
import { useStyles } from '../../styles';
import styles from './TextArea.module.css';

const { useUIState } = hooks;

const TextArea = forwardRef<
  HTMLTextAreaElement,
  Readonly<{
    'aria-label'?: string | undefined;
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
    onClick?: MouseEventHandler<HTMLTextAreaElement> | undefined;
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
        classNames['sendbox__text-area'],
        classNames['sendbox__text-area--scroll'],
        { [classNames['sendbox__text-area--hidden']]: props.hidden },
        { [classNames['sendbox__text-area--in-completion']]: props.completion },
        props.className
      )}
      role={props.hidden ? 'hidden' : undefined}
    >
      {uiState === 'blueprint' ? (
        <div className={cx(classNames['sendbox__text-area-doppelganger'], classNames['sendbox__text-area-shared'])}>
          {' '}
        </div>
      ) : (
        <Fragment>
          <div className={cx(classNames['sendbox__text-area-doppelganger'], classNames['sendbox__text-area-shared'])}>
            {props.completion ? props.completion : props.value || props.placeholder}{' '}
          </div>
          <textarea
            aria-disabled={disabled}
            aria-label={props['aria-label']}
            className={cx(classNames['sendbox__text-area-input'], classNames['sendbox__text-area-shared'])}
            data-testid={props['data-testid']}
            onClick={props.onClick}
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
