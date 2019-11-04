import React from 'react';

import useTimer from './utils/useTimer';

export default function Timer({ onComplete, setTimeRemaining, timeRemaining }) {
  const ms = timeRemaining || 0;

  useTimer(timeRemaining, onComplete, setTimeRemaining);

  return (
    <div className="timer">
      Time Remaining:{' '}
      <span className={`${timeRemaining < 10000 ? 'timer-red' : ''}`}>
        {Math.floor(ms / 60000)}:{('0' + (Math.floor(ms / 1000) % 60)).slice(-2)}
      </span>
    </div>
  );
}
