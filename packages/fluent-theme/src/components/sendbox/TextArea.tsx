import cx from 'classnames';
import React, { forwardRef, useCallback, type FormEventHandler, type KeyboardEventHandler } from 'react';

import { useStyles } from '../../styles';

const styles = {
  'webchat-fluent__sendbox__text-area': {
    display: 'grid',
    gridTemplateAreas: `'main'`,
    maxHeight: '200px',
    overflow: 'hidden'
  },

  'webchat-fluent__sendbox__text-area-shared': {
    border: 'none',
    font: 'inherit',
    gridArea: 'main',
    outline: 'inherit',
    overflowWrap: 'anywhere',
    resize: 'inherit',
    scrollbarGutter: 'stable'
  },

  'webchat-fluent__sendbox__text-area-doppelganger': {
    overflow: 'hidden',
    visibility: 'hidden',
    whiteSpace: 'pre-wrap'
  },

  'webchat-fluent__sendbox__text-area-input': {
    height: '100%',
    padding: 0
  },

  'webchat-fluent__sendbox__text-area-input--scroll': {
    /* Firefox */
    MozScrollbarColor: 'var(--webchat-colorNeutralBackground5) var(--webchat-colorNeutralForeground2)',
    MozScrollbarWidth: 'thin',

    /* Chrome, Edge, and Safari */
    '&::-webkit-scrollbar': {
      width: '8px'
    },

    '&::-webkit-scrollbar-track': {
      backgroundColor: ' var(--webchat-colorNeutralBackground5)',
      borderRadius: '16px'
    },

    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'var(--webchat-colorNeutralForeground2)',
      borderRadius: '16px'
    },

    '&::-webkit-scrollbar-corner': {
      backgroundColor: 'var(--webchat-colorNeutralBackground5)'
    }
  }
};

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
        classNames['webchat-fluent__sendbox__text-area'],
        {
          [classNames['webchat-fluent__sendbox__text-area--hidden']]: props.hidden
        },
        props.className
      )}
      role={props.hidden ? 'hidden' : undefined}
    >
      <div
        className={cx(
          classNames['webchat-fluent__sendbox__text-area-doppelganger'],
          classNames['webchat-fluent__sendbox__text-area-shared'],
          classNames['webchat-fluent__sendbox__text-area-input--scroll']
        )}
      >
        {props.value || props.placeholder}{' '}
      </div>
      <textarea
        aria-label={props['aria-label']}
        className={cx(
          classNames['webchat-fluent__sendbox__text-area-input'],
          classNames['webchat-fluent__sendbox__text-area-shared'],
          classNames['webchat-fluent__sendbox__text-area-input--scroll']
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
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;
