import mathRandom from 'math-random';
import React, { memo, useMemo, type ReactNode } from 'react';

import useReactCodeBlockClass from './customElements/CodeBlock';
import useReactCodeBlockCopyButtonClass from './customElements/CodeBlockCopyButton';
import CustomElementsContext from './private/CustomElementsContext';

type CustomElementsComposerProps = Readonly<{
  children?: ReactNode | undefined;
}>;

// A tag name cannot be defined twice, but React can register the same class twice, e.g. Strict Mode in React 19 calls `useMemo()` twice.
const tagNameByClass = new WeakMap<CustomElementConstructor, string>();

function registerCustomElement(tagName: string, customElementConstructor: CustomElementConstructor): string {
  let fullTagName = tagNameByClass.get(customElementConstructor);

  if (!fullTagName) {
    // Every class gets its own tag name, so elements created after a class changed (e.g. a new ponyfill) never use an older class.
    // eslint-disable-next-line no-magic-numbers
    fullTagName = `webchat-${mathRandom().toString(36).substring(2, 7)}--${tagName}`;

    customElements.define(
      fullTagName,
      class extends customElementConstructor {
        static get observedAttributes(): readonly string[] {
          return Object.freeze(
            'observedAttributes' in customElementConstructor
              ? (customElementConstructor.observedAttributes as string[])
              : []
          );
        }
      }
    );

    tagNameByClass.set(customElementConstructor, fullTagName);
  }

  return fullTagName;
}

const CustomElementsComposer = ({ children }: CustomElementsComposerProps) => {
  const [CodeBlockCopyButtonClass] = useReactCodeBlockCopyButtonClass();

  const codeBlockCopyButtonTagName = useMemo(
    () => registerCustomElement('code-block-copy-button', CodeBlockCopyButtonClass),
    [CodeBlockCopyButtonClass]
  );

  const CodeBlockClass = useReactCodeBlockClass(codeBlockCopyButtonTagName);

  const codeBlockTagName = useMemo(() => registerCustomElement('code-block', CodeBlockClass), [CodeBlockClass]);

  const context = useMemo(
    () => Object.freeze({ codeBlockTagName, codeBlockCopyButtonTagName }),
    [codeBlockTagName, codeBlockCopyButtonTagName]
  );

  return <CustomElementsContext.Provider value={context}>{children}</CustomElementsContext.Provider>;
};

export default memo(CustomElementsComposer);
