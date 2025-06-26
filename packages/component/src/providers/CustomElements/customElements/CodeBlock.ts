/* eslint-disable class-methods-use-this */
import { hooks } from 'botframework-webchat-api';
import { ReactNode, useMemo, useRef } from 'react';

import { useStyleSet } from '../../../hooks';
import { defaultHighlightCode, HighlightCodeFn } from '../../../hooks/internal/codeHighlighter/index';
import { parseDocumentFragmentFromString, useCodeHighlighter } from '../../../internal';

const { useStyleOptions, useLocalizer } = hooks;

class CodeBlock extends HTMLElement {
  static observedAttributes = ['theme', 'language'];

  #connected = false;
  #originalFragment: DocumentFragment = undefined;
  #updateTask?: Promise<void>;

  copyButtonElement: HTMLElement;

  get code() {
    return this.querySelector('code')?.textContent ?? '';
  }

  get theme() {
    return this.getAttribute('theme');
  }
  set theme(value: string) {
    this.setAttribute('theme', value);
  }

  get language() {
    return this.getAttribute('language');
  }
  set language(value: string) {
    this.setAttribute('language', value);
  }

  get options() {
    const { theme } = this;
    return theme ? { theme } : undefined;
  }

  connectedCallback() {
    this.#connected = true;
    this.scheduleUpdate();
  }

  disconnectedCallback() {
    this.#connected = false;
  }

  attributeChangedCallback(_name: string, oldValue: string, newValue: string) {
    const updated = !Object.is(oldValue, newValue);

    this.#connected && updated && this.scheduleUpdate();
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
    options?.theme && body?.classList.add(`webchat__code-block__theme--${options.theme}`);

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

export type CodeBlockProps = Readonly<{
  children?: ReactNode | undefined;
  className?: string | undefined;
  language?: string | undefined;
  theme?: string | undefined;
}>;

type CodeBlockReactProps = Readonly<{
  codeBlockClass: string | undefined;
  codeBlockTheme: 'github-light-default' | 'github-dark-default';
  copyButtonAltCopied: string;
  copyButtonAltCopy: string;
  copyButtonClassName: string;
  copyButtonTagName: string;
  highlightCode: HighlightCodeFn;
}>;

const useCodeBlockProps = (copyButtonTagName: string) => {
  const highlightCode = useCodeHighlighter();
  const localize = useLocalizer();
  const [{ codeBlock: codeBlockClass, codeBlockCopyButton: copyButtonClassName }] = useStyleSet();
  const [{ codeBlockTheme }] = useStyleOptions();
  const copyButtonAltCopied = localize('COPY_BUTTON_COPIED_TEXT');
  const copyButtonAltCopy = localize('COPY_BUTTON_TEXT');
  const propsChangedEventTarget = useMemo<EventTarget>(() => new EventTarget(), []);
  const propsRef = useRef<CodeBlockReactProps>();

  useMemo(() => {
    propsRef.current = Object.freeze({
      codeBlockClass,
      codeBlockTheme,
      copyButtonAltCopied,
      copyButtonAltCopy,
      copyButtonClassName,
      copyButtonTagName,
      highlightCode
    });

    propsChangedEventTarget.dispatchEvent(new CustomEvent('change'));
  }, [
    codeBlockClass,
    codeBlockTheme,
    copyButtonAltCopied,
    copyButtonAltCopy,
    copyButtonClassName,
    copyButtonTagName,
    highlightCode,
    propsChangedEventTarget
  ]);

  return useMemo(
    () => Object.freeze([propsChangedEventTarget, propsRef] as const),
    [propsChangedEventTarget, propsRef]
  );
};

export default function useReactCodeBlockClass(copyButtonTagName: string) {
  const [codeBlockTarget, codeBlockPropsRef] = useCodeBlockProps(copyButtonTagName);

  return useMemo(
    () =>
      class ReactCodeBlock extends CodeBlock {
        static observedAttributes = CodeBlock.observedAttributes;

        #prevProps: CodeBlockReactProps | undefined;

        get #props() {
          return codeBlockPropsRef.current;
        }

        #handlePropsChange = () => {
          const props = this.#props;
          const prevProps = this.#prevProps;

          this.#prevProps = props;

          if (prevProps?.codeBlockClass !== props?.codeBlockClass) {
            prevProps?.codeBlockClass && this.classList.remove(prevProps.codeBlockClass);
            props?.codeBlockClass && this.classList.add(props.codeBlockClass);
          }

          this.setAttribute('theme', props.codeBlockTheme);

          if (prevProps?.highlightCode !== props.highlightCode) {
            this.scheduleUpdate();
          }

          if (prevProps?.copyButtonTagName !== props.copyButtonTagName || !this.copyButtonElement) {
            const { ownerDocument: document } = this;

            this.copyButtonElement = document.createElement(props.copyButtonTagName);
            this.scheduleUpdate();
          }

          this.copyButtonElement.className = props.copyButtonClassName;
          this.copyButtonElement.dataset.altCopy = props.copyButtonAltCopy;
          this.copyButtonElement.dataset.altCopied = props.copyButtonAltCopied;
        };

        connectedCallback(): void {
          this.classList.add('webchat__code-block');

          codeBlockTarget.addEventListener('change', this.#handlePropsChange);

          this.#handlePropsChange();
          super.connectedCallback();
        }

        disconnectedCallback(): void {
          codeBlockTarget.removeEventListener('change', this.#handlePropsChange);

          super.disconnectedCallback();
        }

        highlightCode(...args: Parameters<HighlightCodeFn>) {
          const [, language, options] = args;

          if (!language || !options) {
            return defaultHighlightCode(...args);
          }

          return this.#props.highlightCode(...args);
        }
      },
    [codeBlockPropsRef, codeBlockTarget]
  );
}
