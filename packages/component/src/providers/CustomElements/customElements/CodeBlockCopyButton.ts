import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import { type GlobalScopePonyfill } from 'botframework-webchat-core';
import cx from 'classnames';
import { useMemo } from 'react';

import componentIconStyles from '../../../Icon/ComponentIcon.module.css';
import testIds from '../../../testIds';

import styles from './CodeBlockCopyButton.module.css';

const { usePonyfill } = hooks;

// Same as the Copy button of activities.
const COPIED_DURATION = 5_000;

type ClassNames = { readonly [key: string]: string };

function setOrRemoveAttribute(element: HTMLElement, name: string, value: string | undefined): void {
  typeof value === 'string' ? element.setAttribute(name, value) : element.removeAttribute(name);
}

function createCodeBlockCopyButtonClass(
  classNames: ClassNames,
  componentIconClassNames: ClassNames,
  { clearTimeout, setTimeout }: Pick<GlobalScopePonyfill, 'clearTimeout' | 'setTimeout'>
): typeof HTMLElement {
  return class CodeBlockCopyButton extends HTMLElement {
    static get observedAttributes(): readonly string[] {
      return Object.freeze(['class', 'data-alt-copied', 'data-alt-copy']);
    }

    #copied = false;
    #copiedTimeout: ReturnType<typeof setTimeout> | undefined;
    #disabled = false;
    #elements:
      | { readonly button: HTMLButtonElement; readonly copiedIcon: HTMLElement; readonly copyIcon: HTMLElement }
      | undefined;

    attributeChangedCallback(): void {
      this.#update();
    }

    connectedCallback(): void {
      if (!this.#elements) {
        const { ownerDocument: document } = this;
        const button = document.createElement('button');
        const copiedIcon = document.createElement('div');
        const copyIcon = document.createElement('div');

        button.setAttribute('data-testid', testIds.codeBlockCopyButton);
        button.setAttribute('type', 'button');
        copiedIcon.setAttribute('role', 'img');
        copyIcon.setAttribute('role', 'img');

        button.addEventListener('click', this.#handleClick);
        button.replaceChildren(copyIcon, copiedIcon);
        this.replaceChildren(button);

        this.#elements = Object.freeze({ button, copiedIcon, copyIcon });
      }

      this.#update();
    }

    disconnectedCallback(): void {
      this.#setCopied(false);
    }

    #handleClick = (): void => {
      this.#disabled || this.#copy();
    };

    async #copy(): Promise<void> {
      try {
        const { state } = await navigator.permissions.query({
          // "clipboard-write" is not in the types of TypeScript, Chromium supports it.
          name: 'clipboard-write' satisfies string as PermissionName
        });

        if (state === 'granted') {
          await navigator.clipboard?.write([
            new ClipboardItem({ 'text/plain': new Blob([this.dataset.value ?? ''], { type: 'text/plain' }) })
          ]);

          // Copying again restarts the confirmation.
          this.isConnected && this.#setCopied(true);
        } else if (state === 'denied') {
          this.#disabled = true;
          this.#update();
        }
      } catch (error) {
        console.warn('botframework-webchat: Failed to copy code block to clipboard.', error);
      }
    }

    #setCopied(copied: boolean): void {
      this.#copiedTimeout && clearTimeout(this.#copiedTimeout);

      this.#copied = copied;
      this.#copiedTimeout = copied ? setTimeout(() => this.#setCopied(false), COPIED_DURATION) : undefined;
      this.#update();
    }

    #update(): void {
      if (!this.#elements) {
        return;
      }

      const { button, copiedIcon, copyIcon } = this.#elements;
      const copied = this.#copied;
      const { altCopied, altCopy } = this.dataset;

      // A plain button, like the copy button of activities: its name is "Copied" while the confirmation is shown.
      // A live region on the button would raise another event for "Copied", then an assertive "Copy" when the confirmation ends.
      // The "--copied" classes have no style of their own, they are kept for hosts to style.
      setOrRemoveAttribute(button, 'aria-disabled', this.#disabled ? 'true' : undefined);
      button.className = cx(this.getAttribute('class'), classNames['code-block-copy-button'], {
        'code-block-copy-button--copied': copied
      });

      setOrRemoveAttribute(copyIcon, 'aria-hidden', copied ? 'true' : undefined);
      setOrRemoveAttribute(copyIcon, 'aria-label', altCopy);
      copyIcon.className = cx(
        componentIconClassNames['component-icon'],
        classNames['code-block-copy-button__icon'],
        componentIconClassNames[copied ? 'icon--copy-code-checkmark' : 'icon--copy-code']
      );

      setOrRemoveAttribute(copiedIcon, 'aria-hidden', copied ? undefined : 'true');
      setOrRemoveAttribute(copiedIcon, 'aria-label', altCopied);
      copiedIcon.className = cx(classNames['code-block-copy-button__icon'], 'code-block-copy-button__icon--copied');
    }
  };
}

/**
 * Creates the custom element class of the copy button of code blocks.
 *
 * It is a plain custom element without React: it works with any version of React, and its events propagate through the DOM, e.g. ESCAPE to the activity.
 */
export default function useReactCodeBlockCopyButtonClass(): readonly [typeof HTMLElement] {
  const [ponyfill] = usePonyfill();
  const classNames = useStyles(styles);
  const componentIconClassNames = useStyles(componentIconStyles);

  return useMemo(
    () => Object.freeze([createCodeBlockCopyButtonClass(classNames, componentIconClassNames, ponyfill)] as const),
    [classNames, componentIconClassNames, ponyfill]
  );
}
