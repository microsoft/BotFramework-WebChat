import React, { type ReactNode, memo } from 'react';
import { FlairDecoratorMiddlewareProxy } from './FlairDecoratorMiddleware';
import { LoaderDecoratorMiddlewareProxy } from './LoaderDecoratorMiddleware';

function ActivityDecorator({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <FlairDecoratorMiddlewareProxy request={undefined}>
      {children}
      <LoaderDecoratorMiddlewareProxy request={undefined} />
    </FlairDecoratorMiddlewareProxy>
  );
}

export default memo(ActivityDecorator);
