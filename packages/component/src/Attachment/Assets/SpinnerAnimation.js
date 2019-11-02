import PropTypes from 'prop-types';
import React from 'react';

import useStyleSet from '../../hooks/useStyleSet';

const SpinnerAnimation = () => {
  const [{ spinnerAnimation: spinnerAnimationStyleSet }] = useStyleSet();

  return <div className={spinnerAnimationStyleSet} />;
};

SpinnerAnimation.propTypes = {
  styleSet: PropTypes.shape({
    spinnerAnimation: PropTypes.any.isRequired
  }).isRequired
};

export default SpinnerAnimation;
