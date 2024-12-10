/* eslint-disable class-methods-use-this */
import { hooks } from 'botframework-webchat-api';
import { ReactNode, useMemo } from 'react';
import { useRefFrom } from 'use-ref-from';

import { useStyleSet } from '../../../hooks';
import { defaultHighlightCode, HighlightCodeFn } from '../../../hooks/internal/codeHighlighter';
import { parseDocumentFragmentFromString, useCodeHighlighter } from '../../../internal';
import { createElementRegistryWithUpdater } from '../private/useUpdater';

const { useStyleOptions, useLocalizer } = hooks;

class CodeBlock extends HTMLElement {
  static observedAttributes = ['theme', 'language'];

  connected = false;
  copyButtonElement: HTMLElement;
  #originalFragment: DocumentFragment = undefined;
  #updateTask?: Promise<void>;

  get code() {
    return this.querySelector('code')?.textContent ?? '';
  }

  get theme() {
    return this.getAttribute('theme');
  }

  get language() {
    return this.getAttribute('language');
  }

  get options() {
    const { theme } = this;
    return theme ? { theme } : undefined;
  }

  connectedCallback() {
    this.connected = true;
    this.scheduleUpdate();
  }

  disconnectedCallback() {
    this.connected = false;
  }

  attributeChangedCallback(_name: string, oldValue: string, newValue: string) {
    const updated = !Object.is(oldValue, newValue);
    this.connected && updated && this.scheduleUpdate();
  }

  scheduleUpdate() {
    if (this.#updateTask) {
      return;
    }
    this.#updateTask = Promise.resolve().then(() => {
      this.#updateTask = undefined;
      this.update();
    });
  }

  update() {
    const { code, language, options, ownerDocument: document } = this;

    if (!code) {
      return;
    }

    if (!this.#originalFragment) {
      this.#originalFragment = document.createDocumentFragment();
      this.#originalFragment.replaceChildren(...this.children);
    }

    const result = this.highlightCode(code, language, options);
    const highlightedCodeFragment =
      result instanceof DocumentFragment ? result : parseDocumentFragmentFromString(result);

    const body = highlightedCodeFragment.querySelector('pre');
    body?.classList.add('webchat__code-block__body');
    options.theme && body?.classList.add(options.theme);

    highlightedCodeFragment.insertBefore(this.copyButtonElement, highlightedCodeFragment.firstChild);

    this.replaceChildren(highlightedCodeFragment);

    if (this.copyButtonElement) {
      this.copyButtonElement.dataset.value = code;
    }
  }

  highlightCode(...args: Parameters<HighlightCodeFn>) {
    return defaultHighlightCode(...args);
  }
}

const [useCodeBlockUpdater, connectCodeBlock, disconnectCodeBlock] = createElementRegistryWithUpdater<CodeBlock>();

const [useCopyButtonUpdater, connectCopyButton, disconnectCopyButton] = createElementRegistryWithUpdater();

function useCodeBlockHandlers(highlightCode: HighlightCodeFn) {
  const localize = useLocalizer();
  const [{ codeBlock: codeBlockClassName, codeBlockCopyButton: copyButtonClassName }] = useStyleSet();
  const [{ codeBlockTheme }] = useStyleOptions();
  const copyButtonAltCopied = localize('COPY_BUTTON_COPIED_TEXT');
  const copyButtonAltCopy = localize('COPY_BUTTON_TEXT');

  useCodeBlockUpdater(
    (host: CodeBlock) => {
      host.classList.add('webchat__code-block', codeBlockClassName);
      return () => host.classList.remove(codeBlockClassName);
    },
    [codeBlockClassName]
  );

  useCodeBlockUpdater(
    (host: CodeBlock) => {
      codeBlockTheme && host.setAttribute('theme', codeBlockTheme);
    },
    [codeBlockTheme]
  );

  useCodeBlockUpdater(
    (host: CodeBlock) => {
      highlightCode && host.scheduleUpdate();
    },
    [highlightCode]
  );

  useCopyButtonUpdater(
    (button: HTMLElement) => {
      button.className = copyButtonClassName;
      button.dataset.altCopy = copyButtonAltCopy;
      button.dataset.altCopied = copyButtonAltCopied;
    },
    [copyButtonClassName, copyButtonAltCopy, copyButtonAltCopied]
  );
}

export type CodeBlockProps = {
  className?: string | undefined;
  theme?: string | undefined;
  language?: string | undefined;
  children?: ReactNode | undefined;
};

export default function useReactCodeBlockClass(copyButtonTagName: string) {
  const highlightCode = useCodeHighlighter();
  const highlightCodeRef = useRefFrom(highlightCode);

  useCodeBlockHandlers(highlightCode);

  return useMemo(
    () =>
      class ReactCodeBlock extends CodeBlock {
        static observedAttributes = CodeBlock.observedAttributes;

        connectedCallback(): void {
          const { ownerDocument: document } = this;
          this.copyButtonElement ??= document.createElement(copyButtonTagName);

          connectCodeBlock(this);
          connectCopyButton(this.copyButtonElement);
          super.connectedCallback();
        }

        disconnectedCallback(): void {
          disconnectCodeBlock(this);
          disconnectCopyButton(this.copyButtonElement);
          super.disconnectedCallback();
        }

        highlightCode(...args: Parameters<HighlightCodeFn>) {
          const [, language, options] = args;
          if (!language || !options) {
            return defaultHighlightCode(...args);
          }
          return highlightCodeRef.current(...args);
        }
      },
    [copyButtonTagName, highlightCodeRef]
  );
}
