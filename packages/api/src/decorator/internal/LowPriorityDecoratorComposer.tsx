import React, { memo, type ReactNode } from 'react';
import { type DecoratorMiddleware } from '../types';
import InternalDecoratorComposer from './InternalDecoratorComposer';

type LowPriorityDecoratorComposerProps = Readonly<{
  children?: ReactNode | undefined;
  middleware: readonly DecoratorMiddleware[];
}>;

function LowPriorityDecoratorDecomposer({ children, middleware }: LowPriorityDecoratorComposerProps) {
  return (
    <InternalDecoratorComposer middleware={middleware} priority="low">
      {children}
    </InternalDecoratorComposer>
  );
}

export default memo(LowPriorityDecoratorDecomposer);
export { type LowPriorityDecoratorComposerProps };
