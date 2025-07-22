import React, { memo, useMemo, type ReactNode } from 'react';

import HTMLContentTransformContext, {
  type HTMLContentTransformContextType,
  type HTMLContentTransformFunction,
  type HTMLContentTransformMiddleware
} from './private/HTMLContentTransformContext';

type HTMLContentTransformComposerProps = Readonly<{
  children?: ReactNode | undefined;
  middleware?: readonly HTMLContentTransformMiddleware[] | undefined;
}>;

const HTMLContentTransformComposer = memo(({ children, middleware }: HTMLContentTransformComposerProps) => {
  const transform = useMemo<HTMLContentTransformFunction>(() => {
    const enhancers = (middleware || []).map(enhancer => enhancer()).reverse();

    return enhancers.reduce(
      (chain: HTMLContentTransformFunction, fn) => fn(chain),
      fragment => {
        // With bundle or sanitizer installed, it should not fall into this code.

        const result = document.createDocumentFragment();
        const paragraph = document.createElement('p');

        paragraph.textContent = fragment.documentFragment.firstElementChild.outerHTML;
        result.append(paragraph);

        return result;
      }
    );
  }, [middleware]);

  const context = useMemo<HTMLContentTransformContextType>(() => Object.freeze({ transform }), [transform]);

  return <HTMLContentTransformContext.Provider value={context}>{children}</HTMLContentTransformContext.Provider>;
});

HTMLContentTransformComposer.displayName = 'HTMLContentTransformComposer';

export default HTMLContentTransformComposer;
