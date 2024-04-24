import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React from 'react';

import useStyleSet from '../../hooks/useStyleSet';

const { useDirection } = hooks;

const SpinnerAnimation = () => {
  const [{ spinnerAnimation: spinnerAnimationStyleSet }] = useStyleSet();
  const [direction] = useDirection();

  return <div className={classNames(spinnerAnimationStyleSet + '', direction === 'rtl' && 'webchat__spinner--rtl')} />;
};

export default SpinnerAnimation;
