import classNames from 'classnames';
import React, { useCallback, useState } from 'react';

import './Countdown.css';
import useInterval from './utils/useInterval';

const REFRESH_INTERVAL = 500;

function formatTime(ms) {
  return `${Math.floor(ms / 60000)}:${('0' + (Math.floor(ms / 1000) % 60)).slice(-2)}`;
}

export default function Countdown({ to }) {
  const [, setForceRefresh] = useState({});

  const timeRemaining = Math.max(0, to - Date.now());
  const perInterval = useCallback(() => setForceRefresh({}), [setForceRefresh]);

  useInterval(perInterval, Math.max(0, Math.min(REFRESH_INTERVAL, to - Date.now())));

  return (
    <div className="countdown">
      Time Remaining:{' '}
      <span className={classNames('countdown__time', { 'countdown__time--red': timeRemaining < 10000 })}>
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
}
