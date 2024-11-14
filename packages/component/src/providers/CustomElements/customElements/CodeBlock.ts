/* eslint-disable class-methods-use-this */
import { StyleOptions, hooks } from 'botframework-webchat-api';
import { ElementType, ReactNode, RefObject, useMemo } from 'react';
import { defaultHighlightCode } from '../../../hooks/internal/codeHighlighter';
import { HighlightCodeFn, parseDocumentFragmentFromString, useCodeHighlighter } from '../../../internal';
import { OnTrackFn, useUpdater } from '../private/useUpdater';
import { useStyleSet } from '../../../hooks';

class CodeBlock extends HTMLElement {
  static observedAttributes = Object.freeze(['theme', 'language']);

  #copyButtonElement = this.constructCopyButton();

  get code() {
    return this.querySelector('code').textContent;
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
    const content = this.highlight(this.code, this.language, this.options);
    const fragment = content instanceof DocumentFragment ? content : parseDocumentFragmentFromString(content);
    const pre = fragment.querySelector('pre');

    if (pre) {
      pre.classList.add('webchat__code-block__body');
    }

    if (this.#copyButtonElement) {
      this.replaceChildren(this.#copyButtonElement, fragment);
    } else {
      this.replaceChildren(fragment);
    }
  }

  constructCopyButton() {
    return undefined;
  }
}

const createReactCodeBlockClass = (
  ref: RefObject<{
    codeBlockHighlightCode: HighlightCodeFn;
    codeBlockTheme: StyleOptions['codeBlockTheme'];
    copyButtonAltCopied: string;
    copyButtonAltCopy: string;
    copyButtonClassName: string;
    copyButtonTagName: string;
  }>,
  trackChanges: OnTrackFn
) =>
  class ReactCodeBlock extends CodeBlock {
    static observedAttributes = CodeBlock.observedAttributes;

    get options() {
      // Prefer options from element attributes over ones passed from the context
      return {
        theme: ref.current.codeBlockTheme,
        ...super.options
      };
    }

    #stopTrackingChanges = null;
    connectedCallback() {
      super.connectedCallback();
      this.#stopTrackingChanges = trackChanges(() => this.update());
    }
    disconnectedCallback() {
      this.#stopTrackingChanges?.();
    }

    highlight(...args: Parameters<HighlightCodeFn>) {
      return ref.current.codeBlockHighlightCode(...args);
    }

    constructCopyButton() {
      const { ownerDocument: document } = this;
      const { copyButtonAltCopied, copyButtonAltCopy, copyButtonClassName, copyButtonTagName } = ref.current;

      const button = document.createElement(copyButtonTagName);
      button.className = copyButtonClassName;
      button.dataset.altCopied = copyButtonAltCopied;
      button.dataset.altCopy = copyButtonAltCopy;

      return button;
    }
  };

const { useStyleOptions, useLocalizer } = hooks;

function useCodeBlockUpdater(copyButtonTagName: string) {
  const codeBlockHighlightCode = useCodeHighlighter();
  const localize = useLocalizer();

  const [{ codeBlockCopyButton: copyButtonClassName }] = useStyleSet();
  const copyButtonAltCopied = localize('COPY_BUTTON_COPIED_TEXT');
  const copyButtonAltCopy = localize('COPY_BUTTON_TEXT');
  const [{ codeBlockTheme }] = useStyleOptions();

  return useUpdater(
    () => ({
      codeBlockHighlightCode,
      codeBlockTheme,
      copyButtonAltCopied,
      copyButtonAltCopy,
      copyButtonClassName,
      copyButtonTagName
    }),
    [
      codeBlockHighlightCode,
      codeBlockTheme,
      copyButtonAltCopied,
      copyButtonAltCopy,
      copyButtonClassName,
      copyButtonTagName
    ]
  );
}

export type CodeBlockElementType = `webchat-${string}--code-block` &
  ElementType<{
    className?: string | undefined;
    theme?: string | undefined;
    language?: string | undefined;
  }>;

export type CodeBlockProps = {
  className?: string | undefined;
  theme?: string | undefined;
  language?: string | undefined;
  children?: ReactNode | undefined;
};

export default function useReactCodeBlockClass(copyButtonTagName: string) {
  const [ref, trackRefChange] = useCodeBlockUpdater(copyButtonTagName);
  return useMemo(() => createReactCodeBlockClass(ref, trackRefChange), [ref, trackRefChange]);
}
