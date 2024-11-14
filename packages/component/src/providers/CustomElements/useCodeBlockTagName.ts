import { createElement, useMemo } from 'react';
import useCustomElementsContext from './private/useCustomElementsContext';
import { CodeBlockProps } from './customElements/CodeBlock';

export default function useCodeBlockTag() {
  const { codeBlockTagName } = useCustomElementsContext();

  return useMemo(
    () =>
      Object.freeze([
        codeBlockTagName,
        (props: CodeBlockProps) => createElement(codeBlockTagName, { ...props, class: props.className })
      ] as const),
    [codeBlockTagName]
  );
}
