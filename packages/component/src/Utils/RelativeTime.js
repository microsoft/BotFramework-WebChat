import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

import { getLocaleString, localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import ScreenReaderText from '../ScreenReaderText';
import Timer from './Timer';

// This function calculates the next absolute time that the timer should be fired based on the origin (original time received), interval, and current time.
// If the origin is t=260, and we are currently at t=1000, nextTimer must return t=60260.
// If the origin is t=260, and we are currently at t=60260 (exact landing), we must return t=120260, not t=60260.
// This is for fixing bug #2103: https://github.com/microsoft/BotFramework-WebChat/issues/2103.

const TIMER_INTERVAL = 60000;

function nextTimer(origin) {
  const time = new Date(origin).getTime();
  const now = Date.now();

  return time > now ? time : now + TIMER_INTERVAL - ((now - time) % TIMER_INTERVAL);
}

function getText(language, value) {
  return localize('X minutes ago', language, value);
}

const RelativeTime = ({ language, value }) => {
  const [timer, setTimer] = useState(nextTimer(value));
  const handleInterval = useCallback(() => {
    setTimer(nextTimer(value));
  }, [value]);

  const localizedAbsoluteTime = localize('SentAt', language) + getLocaleString(value, language);
  const text = getText(language, value);

  return (
    <React.Fragment>
      <ScreenReaderText text={localizedAbsoluteTime} />
      <span aria-hidden={true}>{text}</span>
      <Timer at={timer} onInterval={handleInterval} />
    </React.Fragment>
  );
};

RelativeTime.propTypes = {
  language: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired
};

export default connectToWebChat(({ language }) => ({ language }))(RelativeTime);
