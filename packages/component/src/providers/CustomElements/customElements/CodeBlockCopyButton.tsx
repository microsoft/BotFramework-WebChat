import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import { type GlobalScopePonyfill } from 'botframework-webchat-core';
import cx from 'classnames';
import React, { memo, useCallback, useMemo } from 'react';
import { useRefFrom } from 'use-ref-from';
import { useStateWithRef } from 'use-state-with-ref';
import { custom, function_, is, object, optional, pipe, readonly, string } from 'valibot';

import useAutoResetState from '../../../hooks/internal/useAutoResetState';
import { ComponentIcon } from '../../../Icon';
import testIds from '../../../testIds';
import wrapAsCustomElement from './wrapAsCustomElement';

import styles from './CodeBlockCopyButton.module.css';

const { usePonyfill } = hooks;

// Same as the Copy button of activities.
const COPIED_DURATION = 5_000;

const codeBlockCopyButtonPropsSchema = pipe(
  object({
    className: optional(string()),
    'data-alt-copied': optional(string()),
    'data-alt-copy': optional(string()),
    'data-value': optional(string()),
    ponyfill: custom<Pick<GlobalScopePonyfill, 'clearTimeout' | 'setTimeout'>>(value =>
      is(object({ clearTimeout: function_(), setTimeout: function_() }), value)
    )
  }),
  readonly()
);

type CodeBlockCopyButtonProps = InferReactProps<typeof codeBlockCopyButtonPropsSchema>;

function CodeBlockCopyButton(props: CodeBlockCopyButtonProps) {
  const {
    className,
    'data-alt-copied': copiedAlt,
    'data-alt-copy': copyAlt,
    'data-value': value,
    ponyfill
  } = validateProps(codeBlockCopyButtonPropsSchema, props);

  const [copied, setCopied] = useAutoResetState(false, COPIED_DURATION, ponyfill);
  const [disabled, setDisabled, disabledRef] = useStateWithRef(false);
  const classNames = useStyles(styles);
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
        aria-label={copyAlt}
        className={cx(classNames['code-block-copy-button__icon'], classNames['code-block-copy-button__icon--copy'])}
        icon={copied ? 'copy-code-checkmark' : 'copy-code'}
        role="img"
      />
      <div
        aria-hidden={copied ? undefined : 'true'}
        aria-label={copiedAlt}
        className={cx(classNames['code-block-copy-button__icon'], 'code-block-copy-button__icon--copied')}
        role="img"
      />
    </button>
  );
}

CodeBlockCopyButton.displayName = 'CodeBlockCopyButton';

const MemoizedCodeBlockCopyButton = memo(CodeBlockCopyButton);

function createCodeBlockCopyButtonClass(ponyfill: CodeBlockCopyButtonProps['ponyfill']): typeof HTMLElement {
  function CodeBlockCopyButtonWithPonyfill(props: Omit<CodeBlockCopyButtonProps, 'ponyfill'>) {
    return <MemoizedCodeBlockCopyButton {...props} ponyfill={ponyfill} />;
  }

  CodeBlockCopyButtonWithPonyfill.displayName = 'CodeBlockCopyButtonWithPonyfill';

  return wrapAsCustomElement(CodeBlockCopyButtonWithPonyfill, [
    'className',
    'data-alt-copied',
    'data-alt-copy',
    'data-value'
  ]);
}

/**
 * Creates the custom element class of the copy button of code blocks.
 *
 * The custom element renders in its own React root, outside of the React tree of Web Chat, so the ponyfill is passed down.
 */
export default function useReactCodeBlockCopyButtonClass(): readonly [typeof HTMLElement] {
  const [ponyfill] = usePonyfill();

  return useMemo(() => Object.freeze([createCodeBlockCopyButtonClass(ponyfill)] as const), [ponyfill]);
}

export { codeBlockCopyButtonPropsSchema, type CodeBlockCopyButtonProps };
