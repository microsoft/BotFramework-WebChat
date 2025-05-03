import { DecoratorComposer, type DecoratorMiddleware } from 'botframework-webchat-api/decorator';
import React, { memo, type ReactNode } from 'react';

import createDefaultActivityGroupingDecoratorMiddleware from '../../Middleware/ActivityGrouping/createDefaultActivityGroupingDecoratorMiddleware';

const middleware: readonly DecoratorMiddleware[] = Object.freeze([
  ...createDefaultActivityGroupingDecoratorMiddleware()
]);

type BuiltInDecoratorProps = Readonly<{
  readonly children?: ReactNode | undefined;
}>;

function BuiltInDecorator({ children }: BuiltInDecoratorProps) {
  return (
    <DecoratorComposer middleware={middleware} priority="low">
      {children}
    </DecoratorComposer>
  );
}

export default memo(BuiltInDecorator);
export { type BuiltInDecoratorProps };
