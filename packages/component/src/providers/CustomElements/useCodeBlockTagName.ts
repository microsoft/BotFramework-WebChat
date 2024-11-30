import { createElement, memo, useMemo } from 'react';
import useCustomElementsContext from './private/useCustomElementsContext';
import { CodeBlockProps } from './customElements/CodeBlock';

export default function useCodeBlockTag() {
  const { codeBlockTagName } = useCustomElementsContext();

  return useMemo(
    () =>
      Object.freeze([
        codeBlockTagName,
        memo((props: CodeBlockProps) => createElement(codeBlockTagName, { ...props, class: props.className }))
      ] as const),
    [codeBlockTagName]
  );
}
