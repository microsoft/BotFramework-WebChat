/* eslint-disable class-methods-use-this */
import { StyleOptions, hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import { ReactNode, RefObject, useMemo } from 'react';

import { defaultHighlightCode } from '../../../hooks/internal/codeHighlighter';
import { HighlightCodeFn, parseDocumentFragmentFromString, useCodeHighlighter } from '../../../internal';
import { OnTrackFn, useUpdater } from '../private/useUpdater';
import { useStyleSet } from '../../../hooks';

class CodeBlock extends HTMLElement {
  static observedAttributes = Object.freeze(['theme', 'language']);

  copyButtonElement = null;
  highlightedCodeElement = null;

  #originalChildren = null;

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
    this.update();
  }

  connectedCallback() {
    this.update();
  }

  highlight(...args: Parameters<HighlightCodeFn>) {
    return defaultHighlightCode(...args);
  }

  update() {
    this.#originalChildren ??= this.children;
    const { code, language, options } = this;

    if (code && !this.highlightedCodeElement) {
      const highlightCodeFragment = this.constructHighlightedCode(code, language, options);
      const [root] = highlightCodeFragment.children;
      this.highlightedCodeElement = root;
      root?.classList.add('webchat__code-block__body');
    }

    const children = this.highlightedCodeElement ? [this.highlightedCodeElement] : this.#originalChildren;

    this.copyButtonElement ??= this.constructCopyButton();

    if (this.copyButtonElement) {
      this.replaceChildren(this.copyButtonElement, ...children);
    } else {
      this.replaceChildren(...children);
    }
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

    connectedCallback() {
      super.connectedCallback();

      if (!this.#controller) {
        this.#controller = new AbortController();

        trackCodeBlockRefChanges(() => {
          this.highlightedCodeElement = null;
          this.update();
        }, this.#controller.signal);

        trackCopyButtonRefChanges(() => {
          this.copyButtonElement = null;
          this.update();
        }, this.#controller.signal);
      }
    }

    disconnectedCallback() {
      this.#controller?.abort();
    }

    highlight(...args: Parameters<HighlightCodeFn>) {
      const [, language] = args;
      if (!language) {
        return super.highlight(...args);
      }
      return codeBlockRef.current.highlightCode(...args);
    }

    update(): void {
      this.className = codeBlockRef.current.className;
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
          className: cx('webchat__code-block', codeBlockClassName),
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
