import PropTypes from 'prop-types';
import React from 'react';

import useLocalizeDate from '../hooks/useLocalizeDate';

const AbsoluteTime = ({ value }) => {
  const absTime = useLocalizeDate(value);

  return (
    <React.Fragment>
      <span aria-hidden={true}>{absTime}</span>
    </React.Fragment>
  );
};

AbsoluteTime.propTypes = {
  value: PropTypes.string.isRequired
};

export default AbsoluteTime;
