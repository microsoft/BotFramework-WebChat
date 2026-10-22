import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React, { memo, useCallback, useMemo } from 'react';
import { useRefFrom } from 'use-ref-from';
import { useStateWithRef } from 'use-state-with-ref';
import { object, optional, pipe, readonly, string } from 'valibot';

import useAutoResetState from '../../../hooks/internal/useAutoResetState';
import { ComponentIcon } from '../../../Icon';
import testIds from '../../../testIds';
import type CustomElementPortalRegistry from '../private/CustomElementPortalRegistry';
import wrapAsCustomElement from './wrapAsCustomElement';

import styles from './CodeBlockCopyButton.module.css';

const { useLocalizer, usePonyfill } = hooks;

// Same as the Copy button of activities.
const COPIED_DURATION = 5_000;

const codeBlockCopyButtonPropsSchema = pipe(
  object({
    className: optional(string()),
    'data-value': optional(string())
  }),
  readonly()
);

type CodeBlockCopyButtonProps = InferReactProps<typeof codeBlockCopyButtonPropsSchema>;

function CodeBlockCopyButton(props: CodeBlockCopyButtonProps) {
  const { className, 'data-value': value } = validateProps(codeBlockCopyButtonPropsSchema, props);

  const [ponyfill] = usePonyfill();
  const [copied, setCopied] = useAutoResetState(false, COPIED_DURATION, ponyfill);
  const [disabled, setDisabled, disabledRef] = useStateWithRef(false);
  const classNames = useStyles(styles);
  const localize = useLocalizer();
  const valueRef = useRefFrom(value);

  const handleClick = useCallback(() => {
    if (disabledRef.current) {
      return;
    }

    let obsoleted = false;

    (async () => {
      try {
        const { state } = await navigator.permissions.query({ name: 'clipboard-write' as any });

        if (!obsoleted) {
          if (state === 'granted') {
            await navigator.clipboard?.write([
              new ClipboardItem({ 'text/plain': new Blob([valueRef.current], { type: 'text/plain' }) })
            ]);

            // Copying again restarts the confirmation.
            obsoleted || setCopied(true);
          } else if (state === 'denied') {
            setDisabled(true);
          }
        }
      } catch (error) {
        console.warn('botframework-webchat: Failed to copy code block to clipboard.', error);
      }
    })();

    return () => {
      obsoleted = true;
    };
  }, [disabledRef, setCopied, setDisabled, valueRef]);

  // A plain button, like the copy button of activities: its name is "Copied" while the confirmation is shown.
  // A live region on the button would raise another event for "Copied", then an assertive "Copy" when the confirmation ends.
  // The "--copied" classes have no style of their own, they are kept for hosts to style.
  return (
    <button
      aria-disabled={disabled || undefined}
      className={cx(className, classNames['code-block-copy-button'], { 'code-block-copy-button--copied': copied })}
      data-testid={testIds.codeBlockCopyButton}
      onClick={handleClick}
      type="button"
    >
      <ComponentIcon
        aria-hidden={copied ? 'true' : undefined}
        aria-label={localize('COPY_BUTTON_TEXT')}
        className={cx(classNames['code-block-copy-button__icon'], classNames['code-block-copy-button__icon--copy'])}
        icon={copied ? 'copy-code-checkmark' : 'copy-code'}
        role="img"
      />
      <div
        aria-hidden={copied ? undefined : 'true'}
        aria-label={localize('COPY_BUTTON_COPIED_TEXT')}
        className={cx(classNames['code-block-copy-button__icon'], 'code-block-copy-button__icon--copied')}
        role="img"
      />
    </button>
  );
}

CodeBlockCopyButton.displayName = 'CodeBlockCopyButton';

const MemoizedCodeBlockCopyButton = memo(CodeBlockCopyButton);

/**
 * Creates the custom element class of the copy button of code blocks.
 *
 * The button is rendered through a portal in the React tree of Web Chat.
 */
export default function useReactCodeBlockCopyButtonClass(
  portalRegistry: CustomElementPortalRegistry
): readonly [typeof HTMLElement] {
  return useMemo(
    () =>
      Object.freeze([
        wrapAsCustomElement(MemoizedCodeBlockCopyButton, ['className', 'data-value'], portalRegistry)
      ] as const),
    [portalRegistry]
  );
}

export { codeBlockCopyButtonPropsSchema, type CodeBlockCopyButtonProps };
