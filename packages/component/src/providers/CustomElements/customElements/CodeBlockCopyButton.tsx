import classNames from 'classnames';
import React, { memo, useCallback, useState } from 'react';
import { useRefFrom } from 'use-ref-from';
import { useStateWithRef } from 'use-state-with-ref';

import { ComponentIcon } from '../../../Icon';
import testIds from '../../../testIds';
import wrapAsCustomElement from './wrapAsCustomElement';

export type CodeBlockCopyButtonProps = Readonly<{
  className: string;
  'data-alt-copied': string;
  'data-alt-copy': string;
  'data-value': string;
}>;

const CodeBlockCopyButton = memo(
  ({
    className,
    'data-alt-copied': copiedAlt,
    'data-alt-copy': copyAlt,
    'data-value': value
  }: CodeBlockCopyButtonProps) => {
    const [disabled, setDisabled, disabledRef] = useStateWithRef(false);
    const [pressed, setPressed] = useState(false);
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

              obsoleted || setPressed(true);
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
    }, [disabledRef, setDisabled, setPressed, valueRef]);

    const handleAnimationEnd = useCallback(() => setPressed(false), [setPressed]);

    return (
      <button
        aria-disabled={disabled}
        aria-live="assertive"
        aria-pressed={pressed ? 'true' : undefined}
        className={classNames(className, 'webchat__code-block-copy-button', {
          'webchat__code-block-copy-button--copied': pressed
        })}
        data-testid={testIds.codeBlockCopyButton}
        onAnimationEnd={handleAnimationEnd}
        onClick={handleClick}
        type="button"
      >
        <ComponentIcon
          aria-hidden={pressed ? 'true' : undefined}
          aria-label={copyAlt}
          className="webchat__code-block-copy-button__icon webchat__code-block-copy-button__icon--copy"
          icon={pressed ? 'copy-code-checkmark' : 'copy-code'}
          role="img"
        />
        <div
          aria-hidden={pressed ? undefined : 'true'}
          aria-label={copiedAlt}
          className="webchat__code-block-copy-button__icon webchat__code-block-copy-button__icon--copied"
          role="img"
        />
      </button>
    );
  }
);

CodeBlockCopyButton.displayName = 'CodeBlockCopyButton';

const CodeBlockCopyButtonElement = wrapAsCustomElement(CodeBlockCopyButton, [
  'className',
  'data-alt-copied',
  'data-alt-copy',
  'data-value'
]);

export default CodeBlockCopyButton;

export { CodeBlockCopyButtonElement };
