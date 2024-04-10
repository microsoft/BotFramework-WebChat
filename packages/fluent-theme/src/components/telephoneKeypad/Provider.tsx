import React, { memo, useMemo, useState, type ReactNode } from 'react';

import Context from './private/Context';

type Props = Readonly<{ children?: ReactNode | undefined }>;

const Provider = memo(({ children }: Props) => {
  const [shown, setShown] = useState(false);

  const context = useMemo(
    () =>
      Object.freeze({
        setShown,
        shown
      }),
    [setShown, shown]
  );

  return <Context.Provider value={context}>{children}</Context.Provider>;
});

export default Provider;
