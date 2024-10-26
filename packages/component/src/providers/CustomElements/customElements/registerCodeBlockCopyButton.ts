import testIds from '../../../testIds';

type ObservedAttributes = 'className' | 'data-alt-copied' | 'data-alt-copy';

class CodeBlockCopyButtonElement extends HTMLElement {
  static observedAttributes: ObservedAttributes[] = ['className', 'data-alt-copied', 'data-alt-copy'];

  constructor() {
    super();

    const copiedIconImageElement = this.ownerDocument.createElement('div');

    copiedIconImageElement.ariaLabel = this.dataset.altCopied;
    copiedIconImageElement.classList.add(
      'webchat__code-block-copy-button__icon',
      'webchat__code-block-copy-button__icon--copied'
    );
    copiedIconImageElement.role = 'img';

    const copyIconImageElement = this.ownerDocument.createElement('div');

    copyIconImageElement.ariaLabel = this.dataset.altCopy;
    copyIconImageElement.classList.add(
      'webchat__code-block-copy-button__icon',
      'webchat__code-block-copy-button__icon--copy'
    );
    copyIconImageElement.role = 'img';

    const buttonElement = (this.#buttonElement = this.ownerDocument.createElement('button'));

    buttonElement.ariaLive = 'assertive'; // Needed to narrate when the button is pressed.
    buttonElement.classList.add('webchat__code-block-copy-button', this.className);
    buttonElement.dataset.testid = testIds.codeBlockCopyButton;
    buttonElement.type = 'button';

    buttonElement.append(copyIconImageElement);
    buttonElement.append(copiedIconImageElement);

    this.append(buttonElement);

    const showAsPressed = () => {
      buttonElement.ariaPressed = 'true';
      buttonElement.classList.add('webchat__code-block-copy-button--copied');
      copiedIconImageElement.ariaHidden = undefined;
      copyIconImageElement.ariaHidden = 'true';
    };

    const showAsUnpressed = () => {
      buttonElement.ariaPressed = undefined;
      buttonElement.classList.remove('webchat__code-block-copy-button--copied');
      copiedIconImageElement.ariaHidden = 'true';
      copyIconImageElement.ariaHidden = undefined;
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

    this.#buttonElement = buttonElement;
    this.#copiedIconImageElement = copiedIconImageElement;
    this.#copyIconImageElement = copyIconImageElement;
  }

  #buttonElement: HTMLButtonElement;
  #copiedIconImageElement: HTMLDivElement;
  #copyIconImageElement: HTMLDivElement;

  attributeChangedCallback(name: ObservedAttributes, oldValue: string, newValue: string) {
    if (name === 'className') {
      this.#buttonElement.classList.remove(oldValue);
      this.#buttonElement.classList.add(newValue);
    } else if (name === 'data-alt-copied') {
      this.#copiedIconImageElement.ariaLabel = this.dataset.altCopied;
    } else if (name === 'data-alt-copy') {
      this.#copyIconImageElement.ariaLabel = this.dataset.altCopy;
    }
  }
}

export default function registerCodeBlockCopyButton(hash: string): string {
  // Allowed tag names are specified here, https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define#valid_custom_element_names
  const name = `webchat-${hash}--code-block-copy-button`;

  customElements.define(name, CodeBlockCopyButtonElement);

  return name;
}
