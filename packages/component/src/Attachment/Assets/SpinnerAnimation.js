import React from 'react';

import useStyleSet from '../../hooks/useStyleSet';

const SpinnerAnimation = () => {
  const styleSet = useStyleSet();

  return <div className={styleSet.spinnerAnimation} />;
};

export default SpinnerAnimation;
