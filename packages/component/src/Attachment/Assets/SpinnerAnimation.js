import React from 'react';

import useStyleSet from '../../hooks/useStyleSet';

const SpinnerAnimation = () => {
  const [{ spinnerAnimation: spinnerAnimationStyleSet }] = useStyleSet();

  return <div className={spinnerAnimationStyleSet} />;
};

export default SpinnerAnimation;
