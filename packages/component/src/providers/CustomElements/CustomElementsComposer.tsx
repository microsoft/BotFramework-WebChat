import mathRandom from 'math-random';
import React, { memo, useCallback, useMemo, type ReactNode } from 'react';
import { defineAsCustomElementWithPortal } from 'react-define-as-custom-element';

import useReactCodeBlockClass from './customElements/CodeBlock';
import { CodeBlockCopyButtonElement } from './customElements/CodeBlockCopyButton';
import { ReactRegistration } from './customElements/Registration';
import CustomElementsContext from './private/CustomElementsContext';

type CustomElementsComposerProps = Readonly<{
  children?: ReactNode | undefined;
}>;

const createFullTagName = (tagName: string, hash: string) => `webchat-${hash}--${tagName}` as const;

const CustomElementsComposer = ({ children }: CustomElementsComposerProps) => {
  // eslint-disable-next-line no-magic-numbers
  const hash = useMemo(() => mathRandom().toString(36).substring(2, 7), []);

  const registerCustomElement = useCallback(
    (tagName: string, customElementConstructor: CustomElementConstructor): string => {
      const fullTagName = createFullTagName(tagName, hash);

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

  const [registrationTagName, RegistrationPortal] = useMemo(() => {
    const fullTagName = createFullTagName('registration', hash);

    const { Portal } = defineAsCustomElementWithPortal(
      ReactRegistration as any,
      fullTagName,
      { from: 'from' },
      { shadowRoot: { mode: 'open' } }
    );
    return [fullTagName, Portal];
  }, [hash]);

  const context = useMemo(
    () => Object.freeze({ codeBlockTagName, codeBlockCopyButtonTagName, registrationTagName }),
    [codeBlockTagName, codeBlockCopyButtonTagName, registrationTagName]
  );

  return (
    <CustomElementsContext.Provider value={context}>
      <RegistrationPortal />
      {children}
    </CustomElementsContext.Provider>
  );
};

export default memo(CustomElementsComposer);
