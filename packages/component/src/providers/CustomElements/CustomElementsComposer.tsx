import mathRandom from 'math-random';
import React, { memo, useCallback, useMemo, type ReactNode } from 'react';

import useReactCodeBlockClass from './customElements/CodeBlock';
import { CodeBlockCopyButtonElement } from './customElements/CodeBlockCopyButton';
import CustomElementsContext from './private/CustomElementsContext';

type CustomElementsComposerProps = Readonly<{
  children?: ReactNode | undefined;
}>;

const CustomElementsComposer = ({ children }: CustomElementsComposerProps) => {
  // eslint-disable-next-line no-magic-numbers
  const hash = useMemo(() => mathRandom().toString(36).substring(2, 7), []);

  const registerCustomElement = useCallback(
    (tagName: string, customElementConstructor: CustomElementConstructor): string => {
      const fullTagName = `webchat-${hash}--${tagName}` as const;

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

      return fullTagName;
    },
    [hash]
  );

  const codeBlockCopyButtonTagName = useMemo(
    () => registerCustomElement('code-block-copy-button', CodeBlockCopyButtonElement),
    [registerCustomElement]
  );

  const CodeBlockClass = useReactCodeBlockClass(codeBlockCopyButtonTagName);

  const codeBlockTagName = useMemo(
    () => registerCustomElement('code-block', CodeBlockClass),
    [CodeBlockClass, registerCustomElement]
  );

  const context = useMemo(
    () => Object.freeze({ codeBlockTagName, codeBlockCopyButtonTagName }),
    [codeBlockTagName, codeBlockCopyButtonTagName]
  );

  return <CustomElementsContext.Provider value={context}>{children}</CustomElementsContext.Provider>;
};

export default memo(CustomElementsComposer);
