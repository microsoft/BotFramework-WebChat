import React, { Fragment, memo, type ReactNode } from 'react';
import InternalDecoratorComposer from './internal/InternalDecoratorComposer';
import { type DecoratorMiddleware } from './types';

type DecoratorComposerProps = Readonly<{
  children?: ReactNode | undefined;
  middleware?: readonly DecoratorMiddleware[] | undefined;
}>;

function DecoratorComposer({ children, middleware }: DecoratorComposerProps) {
  return middleware ? (
    <InternalDecoratorComposer middleware={middleware} priority="normal">
      {children}
    </InternalDecoratorComposer>
  ) : (
    // We can't return `children` unless we are not using memo().
    <Fragment>{children}</Fragment>
  );
}

export default memo(DecoratorComposer);
export { type DecoratorComposerProps };
