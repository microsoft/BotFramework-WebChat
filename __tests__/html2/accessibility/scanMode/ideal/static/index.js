import init, { transform } from 'https://esm.sh/@esm.sh/tsx';
import { waitFor } from 'https://esm.sh/@testduet/wait-for';
import './private/FocusTrap.js';

async function render() {
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
  get activeChatMessage() {
    const activeChatMessages = document.querySelectorAll('.chat-message__is-active[data-testid="chat message"]');

    if (activeChatMessages.length > 1) {
      throw new Error('ASSERTION: should not have more than one chat message is active');
    }

    return activeChatMessages[0];
  },
  get activeChatMessageBody() {
    const activeChatMessageBodies = document.querySelectorAll(
      '.chat-message__is-active[data-testid="chat message"] [data-testid="chat message body"]'
    );

    if (activeChatMessageBodies.length > 1) {
      throw new Error('ASSERTION: should not have more than one chat message is active');
    }

    return activeChatMessageBodies[0];
  },
  get activeDescendant() {
    return document.getElementById(
      document.querySelector('[data-testid="chat history"]').getAttribute('aria-activedescendant')
    );
  },
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
  }
};

export { render, systemUnderTest };
