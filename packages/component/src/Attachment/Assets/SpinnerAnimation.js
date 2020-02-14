import classNames from 'classnames';
import React from 'react';

import useDirection from '../../hooks/useDirection';
import useStyleSet from '../../hooks/useStyleSet';

const SpinnerAnimation = () => {
  const [{ spinnerAnimation: spinnerAnimationStyleSet }] = useStyleSet();
  const [direction] = useDirection();

  return <div className={classNames(spinnerAnimationStyleSet + '', direction === 'rtl' && 'webchat__spinner--rtl')} />;
};

export default SpinnerAnimation;
