import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React, {
  forwardRef,
  Fragment,
  useCallback,
  useRef,
  type FormEventHandler,
  type KeyboardEventHandler,
  type MouseEventHandler
} from 'react';
import { boolean, custom, number, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import styles from './TextArea.module.css';

const { useUIState } = hooks;

const TextAreaPropsSchema = pipe(
  object({
    'aria-describedby': optional(string()),
    'aria-label': optional(string()),
    'aria-labelledby': optional(string()),
    className: optional(string()),
    completion: optional(reactNode()),
    'data-testid': optional(string()),
    /**
     * `true`, if the text area should be hidden but stay in the DOM, otherwise, `false`.
     *
     * Keeping the element in the DOM while making it invisible to users and PWDs is useful in these scenarios:
     *
     * - When the DTMF keypad is going away, we need to send focus to the text area before we unmount DTMF keypad,
     *   This ensures the flow of focus did not sent to document body
     */
    hidden: optional(boolean()),
    onClick: optional(custom<MouseEventHandler<HTMLTextAreaElement>>(value => typeof value === 'function')),
    onInput: optional(custom<FormEventHandler<HTMLTextAreaElement>>(value => typeof value === 'function')),
    placeholder: optional(string()),
    readOnly: optional(boolean()),
    startRows: optional(number()),
    value: optional(string())
  }),
  readonly()
);

type TextAreaProps = InferInput<typeof TextAreaPropsSchema>;

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>((rawProps, ref) => {
  const props = validateProps(TextAreaPropsSchema, rawProps);

  const [uiState] = useUIState();
  const classNames = useStyles(styles);
  const isInCompositionRef = useRef<boolean>(false);

  const disabled = uiState === 'disabled' || props.readOnly;

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
            {props.completion || props.value}{' '}
          </div>
          <textarea
            aria-describedby={props['aria-describedby']}
            aria-disabled={disabled}
            aria-label={props['aria-label']}
            aria-labelledby={props['aria-labelledby']}
            aria-placeholder={props.placeholder}
            className={cx(classNames['text-area-input'], classNames['text-area-shared'])}
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
export { TextAreaPropsSchema, type TextAreaProps };
