import testIds from '../../../testIds';

type ObservedAttributes = 'class' | 'data-alt-copied' | 'data-alt-copy';

const observedAttributes: readonly ObservedAttributes[] = Object.freeze(['class', 'data-alt-copied', 'data-alt-copy']);

export default class CodeBlockCopyButtonElement extends HTMLElement {
  static get observedAttributes(): readonly ObservedAttributes[] {
    return observedAttributes;
  }

  constructor() {
    super();

    const copiedIconImageElement = (this.#copiedIconImageElement = this.ownerDocument.createElement('div'));

    copiedIconImageElement.classList.add(
      'webchat__code-block-copy-button__icon',
      'webchat__code-block-copy-button__icon--copied'
    );
    copiedIconImageElement.role = 'img';

    const copyIconImageElement = (this.#copyIconImageElement = this.ownerDocument.createElement('div'));

    copyIconImageElement.classList.add(
      'webchat__code-block-copy-button__icon',
      'webchat__code-block-copy-button__icon--copy'
    );
    copyIconImageElement.role = 'img';

    const buttonElement = (this.#buttonElement = this.ownerDocument.createElement('button'));

    buttonElement.ariaLive = 'assertive'; // Needed to narrate when the button is pressed.
    buttonElement.classList.add('webchat__code-block-copy-button');
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
  }

  #buttonElement: HTMLButtonElement;
  #copiedIconImageElement: HTMLDivElement;
  #copyIconImageElement: HTMLDivElement;

  attributeChangedCallback(name: ObservedAttributes, oldValue: string, newValue: string) {
    if (name === 'class') {
      this.#buttonElement.classList.remove(oldValue);
      this.#buttonElement.classList.add(newValue);
    } else if (name === 'data-alt-copied') {
      this.#copiedIconImageElement.ariaLabel = this.dataset.altCopied;
    } else if (name === 'data-alt-copy') {
      this.#copyIconImageElement.ariaLabel = this.dataset.altCopy;
    }
  }
}
