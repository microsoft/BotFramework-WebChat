import { createContext } from 'react';
import { type DecoratorMiddleware } from './createDecoratorComposer';

type DecoratorComposerContextType = Readonly<{
  middleware: readonly DecoratorMiddleware[];
}>;

const DecoratorComposerContext = createContext<DecoratorComposerContextType>(Object.freeze({ middleware: [] }));

export default DecoratorComposerContext;
export { type DecoratorComposerContextType };
