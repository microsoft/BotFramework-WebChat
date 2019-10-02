import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../../connectToWebChat';

const SpinnerAnimation = ({ styleSet }) => <div className={styleSet.spinnerAnimation} />;

SpinnerAnimation.propTypes = {
  styleSet: PropTypes.shape({
    spinnerAnimation: PropTypes.any.isRequired
  }).isRequired
};

const ConnectedSpinnerAnimation = connectToWebChat(({ styleSet }) => ({ styleSet }))(SpinnerAnimation);

export default ConnectedSpinnerAnimation;
