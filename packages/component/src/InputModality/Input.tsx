import React, { Fragment, memo, useMemo } from 'react';

import useProxyComponent from './private/useProxyComponent';
import useType from './useType';

const Input = memo(() => {
  const [Proxy] = useProxyComponent();
  const [type] = useType();

  const request = useMemo(() => ({ type }), [type]);

  return (
    <Fragment>
      <div>{type}</div>
      <Proxy request={request} />
    </Fragment>
  );
});

export default Input;
