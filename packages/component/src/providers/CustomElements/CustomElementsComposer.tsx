import { hooks } from 'botframework-webchat-api';
import mathRandom from 'math-random';
import React, { memo, useMemo, type ReactNode } from 'react';
import { useStyleSet } from '../../hooks';
import registerCodeBlockCopyButton from './customElements/registerCodeBlockCopyButton';
import CustomElementsContext from './private/CustomElementsContext';

type CustomElementsComposerProps = Readonly<{
  children?: ReactNode | undefined;
}>;

const { useLocalizer } = hooks;

const CustomElementsComposer = ({ children }: CustomElementsComposerProps) => {
  const localize = useLocalizer();
  const [styleSet] = useStyleSet();
  // eslint-disable-next-line no-magic-numbers
  const hash = useMemo(() => mathRandom().toString(36).substring(2, 7), []);

  const copiedText = localize('COPY_BUTTON_COPIED_TEXT');
  const copyText = localize('COPY_BUTTON_TEXT');

  const codeBlockCopyButtonTagName = useMemo(
    () => registerCodeBlockCopyButton(hash, Object.freeze({ copiedText, copyText }), styleSet),
    [copiedText, copyText, hash, styleSet]
  );

  const context = useMemo(() => Object.freeze({ codeBlockCopyButtonTagName }), [codeBlockCopyButtonTagName]);

  return <CustomElementsContext.Provider value={context}>{children}</CustomElementsContext.Provider>;
};

export default memo(CustomElementsComposer);
