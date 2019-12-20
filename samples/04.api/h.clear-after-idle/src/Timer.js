import React from 'react';

export default function Timer({ timeRemaining }) {
  const ms = timeRemaining || 0;

  return (
    <div className="timer">
      Time Remaining:{' '}
      <span className={`${timeRemaining < 10000 ? 'timer-red' : ''}`}>
        {Math.floor(ms / 60000)}:{('0' + (Math.floor(ms / 1000) % 60)).slice(-2)}
      </span>
    </div>
  );
}
