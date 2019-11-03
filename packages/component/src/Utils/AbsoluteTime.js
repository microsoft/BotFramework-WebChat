import PropTypes from 'prop-types';
import React from 'react';

import ScreenReaderText from '../ScreenReaderText';

import useLocalize from '../hooks/useLocalize';
import useLocalizeDate from '../hooks/useLocalizeDate';

const AbsoluteTime = ({ value }) => {
  const localizedTime = useLocalizeDate(value);
  const text = useLocalize('SentAt', language) + localizedTime;

  return (
    <React.Fragment>
      <ScreenReaderText text={text} />
      <span aria-hidden={true}>{localizedTime}</span>
    </React.Fragment>
  );
};

AbsoluteTime.propTypes = {
  language: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired
};

export default AbsoluteTime;
