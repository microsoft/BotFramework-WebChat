import { LowPriorityDecoratorComposer } from 'botframework-webchat-api/internal';
import React, { memo, type ReactNode } from 'react';

import createDefaultActivityGroupingDecoratorMiddleware from './Middleware/ActivityGrouping/createDefaultActivityGroupingDecoratorMiddleware';

const middleware = Object.freeze([...createDefaultActivityGroupingDecoratorMiddleware()] as const);

type BuiltInDecoratorProps = Readonly<{
  readonly children?: ReactNode | undefined;
}>;

function BuiltInDecorator({ children }: BuiltInDecoratorProps) {
  return <LowPriorityDecoratorComposer middleware={middleware}>{children}</LowPriorityDecoratorComposer>;
}

export default memo(BuiltInDecorator);
export { type BuiltInDecoratorProps };
