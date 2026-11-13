// @ts-ignore
import init, { transform } from 'https://esm.sh/@esm.sh/tsx';
// @ts-ignore
import { waitFor } from 'https://esm.sh/@testduet/wait-for';
import './private/FocusTrap.js';

async function render({ interactMode } = { interactMode: 1 }) {
  if (!location.hash.startsWith('#mode=')) {
    location.replace(`#mode=${interactMode ?? 1}`);
  }

  await init();

  const res = await fetch(new URL('private/index.tsx', import.meta.url));

  if (!res.ok) {
    throw new Error(`Failed to load ./private/index.tsx, server returned ${res.status}`);
  }

  const code = await res.text();

  const importMap = {
    imports: {
      classnames: 'https://esm.sh/classnames',
      'jest-mock': 'https://esm.sh/jest-mock',
      react: 'https://esm.sh/react',
      'react-dom': 'https://esm.sh/react-dom'
    }
  };

  const transformed = transform({ filename: '/index.tsx', code, importMap });

  const decoder = new TextDecoder();

  const transformedCode = decoder.decode(transformed.code);

  const scriptElement = document.createElement('script');

  scriptElement.setAttribute('type', 'module');
  scriptElement.textContent = transformedCode;

  document.body.append(scriptElement);

  await waitFor(
    () => {
      const textAreaElement = document.querySelector('textarea');

      if (!textAreaElement) {
        throw new Error('No <textarea> element');
      }
    },
    { timeout: 5000 }
  );
}

const systemUnderTest = {
  get chatHistory() {
    return document.querySelector('[data-testid="chat history"]');
  },
  get chatMessages() {
    return Array.from(document.querySelectorAll('[data-testid="chat message"]'));
  },
  get chatMessageBodies() {
    return Array.from(document.querySelectorAll('[data-testid="chat message body"]'));
  },
  get addressForm() {
    return document.querySelector('[data-testid="address form"]');
  },
  get addressFormSubmitButton() {
    return document.querySelector('[data-testid="address form submit button"]');
  },
  get addressFormTextBox() {
    return document.querySelector('[data-testid="street address textbox"]');
  },
  get sendBoxTextBox() {
    return document.querySelector('[data-testid="send box text box"]');
  },
  async focusChatHistory() {
    /** @type {HTMLElement | null} */
    const textBox = document.querySelector('[data-testid="send box text box"]');

    textBox?.focus();

    // @ts-ignore
    // eslint-disable-next-line no-undef
    await host.sendShiftTab();
  }
};

export { render, systemUnderTest };
