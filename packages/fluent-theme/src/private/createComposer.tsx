import React, { type Context, memo, type ReactNode, useMemo } from 'react';

export default function createComposer<
  C,
  P extends { children?: ReactNode | undefined } = Partial<C> & { children?: ReactNode | undefined }
>({ Provider }: Context<C>, { defaults, displayName }: Readonly<{ defaults: Readonly<C>; displayName: string }>) {
  const Composer = ({ children, ...props }: Readonly<P>) => {
    const value = useMemo(() => Object.freeze({ ...defaults, ...props }), [props]);

    return <Provider value={value}>{children}</Provider>;
  };

  Composer.displayName = displayName;

  return memo(Composer);
}
