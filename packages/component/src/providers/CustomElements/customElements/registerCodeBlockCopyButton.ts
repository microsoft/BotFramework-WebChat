import type { useStyleSet } from '../../../hooks';
import testIds from '../../../testIds';

type Strings = Readonly<{
  copiedText: 'Copied';
  copyText: 'Copy';
}>;

type StyleSet = ReturnType<typeof useStyleSet>[0];

export default function registerCodeBlockCopyButton(hash: string, strings: Strings, styleSet: StyleSet): string {
  // Allowed tag names are ASCII alphanumeric only, https://html.spec.whatwg.org/multipage/syntax.html#tag-name.
  const name = `WebChatCodeBlockCopyButton${hash}`;

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

      buttonElement.classList.add('webchat__code-block-copy-button', styleSet.codeBlockCopyButton);
      buttonElement.dataset.testid = testIds.codeBlockCopyButton;
      buttonElement.type = 'button';

      buttonElement.append(copyIconImageElement);
      buttonElement.append(copiedIconImageElement);

      this.append(buttonElement);

      const showAsPressed = () => {
        buttonElement.ariaLabel = strings.copiedText;
        buttonElement.ariaPressed = 'true';
        buttonElement.classList.add('webchat__code-block-copy-button--copied');
      };

      const showAsUnpressed = () => {
        buttonElement.ariaLabel = strings.copyText;
        buttonElement.ariaPressed = '';
        buttonElement.classList.remove('webchat__code-block-copy-button--copied');
      };

      // Initially, show as unpressed.
      showAsUnpressed();

      buttonElement.addEventListener('animationend', () => showAsUnpressed());

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

              showAsPressed();
            } else if (state === 'denied') {
              buttonElement.ariaDisabled = 'true';
            }
          } catch (error) {
            console.warn('botframework-webchat: Failed to copy code block to clipboard.', error);
          }
        })();
      });
    }
  }

  customElements.define(name, CodeBlockCopyButtonElement);

  return name;
}
