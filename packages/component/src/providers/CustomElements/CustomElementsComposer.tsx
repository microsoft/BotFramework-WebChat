import mathRandom from 'math-random';
import React, { memo, useMemo, type ReactNode } from 'react';
import registerCodeBlockCopyButton from './customElements/registerCodeBlockCopyButton';
import CustomElementsContext from './private/CustomElementsContext';

type CustomElementsComposerProps = Readonly<{
  children?: ReactNode | undefined;
}>;

const CustomElementsComposer = ({ children }: CustomElementsComposerProps) => {
  // eslint-disable-next-line no-magic-numbers
  const hash = useMemo(() => mathRandom().toString(36).substring(2, 7), []);

  const codeBlockCopyButtonTagName = useMemo(() => registerCodeBlockCopyButton(hash), [hash]);

  const context = useMemo(() => Object.freeze({ codeBlockCopyButtonTagName }), [codeBlockCopyButtonTagName]);

  return <CustomElementsContext.Provider value={context}>{children}</CustomElementsContext.Provider>;
};

export default memo(CustomElementsComposer);
