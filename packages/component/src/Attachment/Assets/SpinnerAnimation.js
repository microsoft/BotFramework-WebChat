import React from 'react';

import useStyleSet from '../../hooks/useStyleSet';

const SpinnerAnimation = () => {
  const [{ spinnerAnimation }] = useStyleSet();

  return <div className={spinnerAnimation} />;
};

export default SpinnerAnimation;
