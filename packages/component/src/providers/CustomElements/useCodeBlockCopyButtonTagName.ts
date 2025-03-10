import { useMemo } from 'react';
import useCustomElementsContext from './private/useCustomElementsContext';

export default function useCodeBlockCopyButtonTagName(): readonly [string] {
  const { codeBlockCopyButtonTagName } = useCustomElementsContext();

  return useMemo(() => Object.freeze([codeBlockCopyButtonTagName]), [codeBlockCopyButtonTagName]);
}
