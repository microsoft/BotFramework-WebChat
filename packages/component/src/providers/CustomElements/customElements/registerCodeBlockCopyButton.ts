import type { useStyleSet } from '../../../hooks';

type Strings = Readonly<{
  copiedText: 'Copied';
  copyText: 'Copy';
}>;

type StyleSet = ReturnType<typeof useStyleSet>[0];

export default function registerCodeBlockCopyButton(hash: string, strings: Strings, styleSet: StyleSet): string {
  const name = `webchat-${hash}__code-block-copy-button`;

  class CodeBlockCopyButtonElement extends HTMLElement {
    constructor() {
      super();

      const copiedIconImageElement = this.ownerDocument.createElement('div');

      copiedIconImageElement.classList.add(
        'webchat__code-block-copy-button__icon',
        'webchat__code-block-copy-button__icon--copied'
      );

      const copyIconImageElement = this.ownerDocument.createElement('div');

      copyIconImageElement.classList.add(
        'webchat__code-block-copy-button__icon',
        'webchat__code-block-copy-button__icon--copy'
      );

      const buttonElement = this.ownerDocument.createElement('button');

      buttonElement.ariaLabel = strings.copyText;
      buttonElement.classList.add('webchat__code-block-copy-button', styleSet.codeBlockCopyButton);

      buttonElement.addEventListener('animationend', () => {
        buttonElement.ariaLabel = strings.copyText;
        buttonElement.classList.remove('webchat__code-block-copy-button--copied');
      });

      buttonElement.addEventListener('click', () => {
        if (buttonElement.ariaDisabled === 'true') {
          return;
        }

        (async () => {
          try {
            const { state } = await navigator.permissions.query({ name: 'clipboard-write' as any });

            if (state === 'granted') {
              await navigator.clipboard?.write([
                new ClipboardItem({ 'text/plain': new Blob([this.dataset.value], { type: 'text/plain' }) })
              ]);

              buttonElement.ariaLabel = strings.copiedText;
              buttonElement.classList.add('webchat__code-block-copy-button--copied');
            } else if (state === 'denied') {
              buttonElement.ariaDisabled = 'true';
            }
          } catch (error) {
            console.warn('botframework-webchat: Failed to copy code block to clipboard.', error);
          }
        })();
      });

      buttonElement.type = 'button';

      buttonElement.append(copyIconImageElement);
      buttonElement.append(copiedIconImageElement);

      this.append(buttonElement);
    }
  }

  customElements.define(name, CodeBlockCopyButtonElement);

  return name;
}
