import { CodeHighlighterComposer, type HighlightCodeFn } from 'botframework-webchat-component/internal';
import React, { memo, ReactNode, useEffect, useState } from 'react';
import { type HighlighterCore } from 'shiki';

import createHighlighter from './shiki';

const createHighligtCodeWithShiki =
  (shikiHiglighter: HighlighterCore): HighlightCodeFn =>
  (code, language, options) =>
    shikiHiglighter.codeToHtml(code, {
      lang: language,
      theme: options.theme
    });

function ShikiComposer({ children }: { readonly children: ReactNode | undefined }) {
  const [highlightProps, setHighlightProps] = useState<Readonly<{ highlightCode: HighlightCodeFn }>>();

  useEffect(() => {
    let isMounted = true;
    (async () =>
      isMounted &&
      setHighlightProps(
        Object.freeze({
          highlightCode: createHighligtCodeWithShiki(await createHighlighter())
        })
      ))();
    return () => {
      isMounted = false;
    };
  }, []);

  return <CodeHighlighterComposer {...highlightProps}>{children}</CodeHighlighterComposer>;
}

export default memo(ShikiComposer);
