import { createElement, memo, useMemo } from 'react';

import { CodeBlockProps } from './customElements/CodeBlock';
import useCustomElementsContext from './private/useCustomElementsContext';

export default function useCodeBlockTag() {
  const { codeBlockTagName } = useCustomElementsContext();

  return useMemo(
    () =>
      Object.freeze([
        codeBlockTagName,
        memo((props: CodeBlockProps) =>
          createElement(codeBlockTagName, { ...props, class: props.className, className: undefined })
        )
      ] as const),
    [codeBlockTagName]
  );
}
