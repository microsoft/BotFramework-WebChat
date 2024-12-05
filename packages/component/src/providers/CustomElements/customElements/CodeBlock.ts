/* eslint-disable class-methods-use-this */
import { StyleOptions, hooks } from 'botframework-webchat-api';
import { ReactNode, RefObject, useMemo } from 'react';

import { defaultHighlightCode } from '../../../hooks/internal/codeHighlighter';
import { useStyleSet } from '../../../hooks';
import { HighlightCodeFn, parseDocumentFragmentFromString, useCodeHighlighter } from '../../../internal';
import { OnTrackFn, useUpdater } from '../private/useUpdater';

class CodeBlock extends HTMLElement {
  static observedAttributes = Object.freeze(['theme', 'language']);

  connected = false;
  copyButtonElement = undefined;
  highlightedCodeFragment: DocumentFragment = undefined;

  #originalFragment: DocumentFragment = undefined;

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
    return theme
      ? {
          theme
        }
      : undefined;
  }

  attributeChangedCallback() {
    this.highlightedCodeFragment = undefined;
    this.update();
  }

  connectedCallback() {
    this.connected = true;
    this.update();
  }

  disconnectedCallback() {
    this.connected = false;
  }

  highlight(...args: Parameters<HighlightCodeFn>) {
    return defaultHighlightCode(...args);
  }

  update() {
    if (!this.connected) {
      return;
    }

    const { code, language, options, ownerDocument: document } = this;

    if (code && !this.highlightedCodeFragment) {
      const highlightCodeFragment = this.constructHighlightedCode(code, language, options);
      this.highlightedCodeFragment = highlightCodeFragment;
      const body = highlightCodeFragment.querySelector('pre');
      body?.classList.add('webchat__code-block__body');
      options.theme && body?.classList.add(options.theme);
    }

    if (!this.#originalFragment) {
      this.#originalFragment = document.createDocumentFragment();
      this.#originalFragment.replaceChildren(...this.children);
    }

    const sourceFragment = this.highlightedCodeFragment ? this.highlightedCodeFragment : this.#originalFragment;
    const fragment = sourceFragment?.cloneNode(true);

    this.copyButtonElement ??= this.constructCopyButton();
    this.copyButtonElement && fragment.insertBefore(this.copyButtonElement, fragment.firstChild);

    this.replaceChildren(fragment);
  }

  constructCopyButton() {
    return null;
  }

  constructHighlightedCode(...args: Parameters<HighlightCodeFn>) {
    const result = this.highlight(...args);
    return result instanceof DocumentFragment ? result : parseDocumentFragmentFromString(result);
  }
}

const createReactCodeBlockClass = ({
  codeBlockRef,
  copyButtonRef,
  trackCodeBlockRefChanges,
  trackCopyButtonRefChanges
}: {
  codeBlockRef: RefObject<{
    className: string;
    highlightCode: HighlightCodeFn;
    theme: StyleOptions['codeBlockTheme'];
  }>;
  copyButtonRef: RefObject<{
    altCopied: string;
    altCopy: string;
    className: string;
    tagName: string;
  }>;
  trackCodeBlockRefChanges: OnTrackFn;
  trackCopyButtonRefChanges: OnTrackFn;
}) =>
  class ReactCodeBlock extends CodeBlock {
    static observedAttributes = CodeBlock.observedAttributes;

    get options() {
      // Prefer options from element attributes over ones passed from the context
      return {
        theme: codeBlockRef.current.theme,
        ...super.options
      };
    }

    #controller: AbortController;
    #prevClassName: string;

    connectedCallback() {
      super.connectedCallback();

      if (!this.#controller) {
        this.#controller = new AbortController();

        trackCodeBlockRefChanges(() => {
          this.highlightedCodeFragment = undefined;
          this.update();
        }, this.#controller.signal);

        trackCopyButtonRefChanges(() => {
          this.copyButtonElement = undefined;
          this.update();
        }, this.#controller.signal);
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      this.#controller?.abort();
      this.#controller = undefined;
    }

    highlight(...args: Parameters<HighlightCodeFn>) {
      const [, language] = args;
      if (!language) {
        return super.highlight(...args);
      }
      return codeBlockRef.current.highlightCode(...args);
    }

    updateClassName(): void {
      this.#prevClassName && this.classList.remove(this.#prevClassName);
      this.#prevClassName = codeBlockRef.current.className;
      this.classList.add('webchat__code-block', codeBlockRef.current.className);
    }

    update(): void {
      this.updateClassName();
      super.update();
    }

    constructCopyButton() {
      const { ownerDocument: document } = this;
      const { altCopied, altCopy, className, tagName } = copyButtonRef.current;

      const button = document.createElement(tagName);
      button.className = className;
      button.dataset.altCopied = altCopied;
      button.dataset.altCopy = altCopy;

      return button;
    }
  };

const { useStyleOptions, useLocalizer } = hooks;

function useCodeBlockUpdater(copyButtonTagName: string) {
  const codeBlockHighlightCode = useCodeHighlighter();
  const localize = useLocalizer();

  const [{ codeBlock: codeBlockClassName, codeBlockCopyButton: copyButtonClassName }] = useStyleSet();
  const copyButtonAltCopied: string = localize('COPY_BUTTON_COPIED_TEXT');
  const copyButtonAltCopy: string = localize('COPY_BUTTON_TEXT');
  const [{ codeBlockTheme }] = useStyleOptions();

  return [
    useUpdater(
      () =>
        Object.freeze({
          className: codeBlockClassName,
          highlightCode: codeBlockHighlightCode,
          theme: codeBlockTheme
        }),
      [codeBlockClassName, codeBlockHighlightCode, codeBlockTheme]
    ),
    useUpdater(
      () =>
        Object.freeze({
          altCopied: copyButtonAltCopied,
          altCopy: copyButtonAltCopy,
          className: copyButtonClassName as string,
          tagName: copyButtonTagName
        }),
      [copyButtonAltCopied, copyButtonAltCopy, copyButtonClassName, copyButtonTagName]
    )
  ] as const;
}

export type CodeBlockProps = {
  className?: string | undefined;
  theme?: string | undefined;
  language?: string | undefined;
  children?: ReactNode | undefined;
};

export default function useReactCodeBlockClass(copyButtonTagName: string) {
  const [[codeBlockRef, trackCodeBlockRefChanges], [copyButtonRef, trackCopyButtonRefChanges]] =
    useCodeBlockUpdater(copyButtonTagName);
  return useMemo(
    () =>
      createReactCodeBlockClass({
        codeBlockRef,
        copyButtonRef,
        trackCodeBlockRefChanges,
        trackCopyButtonRefChanges
      }),
    [codeBlockRef, copyButtonRef, trackCodeBlockRefChanges, trackCopyButtonRefChanges]
  );
}
