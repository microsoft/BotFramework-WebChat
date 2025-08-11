import React, { Fragment, memo, type ReactNode } from 'react';

type PassthroughFallbackProps = Readonly<{
  children?: ReactNode | undefined;
}>;

function PassthroughFallback({ children }: PassthroughFallbackProps) {
  return <Fragment>{children}</Fragment>;
}

export default memo(PassthroughFallback);
export { type PassthroughFallbackProps };
