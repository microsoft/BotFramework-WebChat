import PropTypes from 'prop-types';
import React from 'react';

import useForceRenderAtInterval from '../hooks/internal/useForceRenderAtInterval';
import useLocalize from '../hooks/useLocalize';

const TIMER_INTERVAL = 60000;

const RelativeTime = ({ value }) => {
  const text = useLocalize('X minutes ago', value);

  useForceRenderAtInterval(value, TIMER_INTERVAL);

  return (
    <React.Fragment>
      <span aria-hidden={true}>{text}</span>
    </React.Fragment>
  );
};

RelativeTime.propTypes = {
  value: PropTypes.string.isRequired
};

export default RelativeTime;
