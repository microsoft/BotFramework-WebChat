import PropTypes from 'prop-types';
import React from 'react';

import { getLocaleString, localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import ScreenReaderText from '../ScreenReaderText';

const AbsoluteTime = ({ language, value }) => {
  const localizedTime = getLocaleString(value, language);

  return (
    <React.Fragment>
      <ScreenReaderText text={localize('SentAt', language) + localizedTime} />
      <span aria-hidden={true}>{localizedTime}</span>
    </React.Fragment>
  );
};

AbsoluteTime.propTypes = {
  language: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired
};

export default connectToWebChat(({ language }) => ({ language }))(AbsoluteTime);
