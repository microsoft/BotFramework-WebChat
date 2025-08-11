import { createContext } from 'react';

import { type DecoratorMiddleware } from '../types';

type DecoratorComposerContextType = Readonly<{
  middleware: readonly DecoratorMiddleware[];
}>;

const DecoratorComposerContext = createContext<DecoratorComposerContextType>(
  Object.freeze({
    middleware: Object.freeze([])
  })
);

export default DecoratorComposerContext;
export { type DecoratorComposerContextType };
