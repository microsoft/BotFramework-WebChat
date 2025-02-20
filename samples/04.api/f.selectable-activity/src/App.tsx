import { type ActivityMiddleware } from 'botframework-webchat-api';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import Inspector from './Inspector';
import ReactWebChat from './WebChat';

function App() {
  const inspectorRef = useRef<HTMLDivElement>(null);
  const [selectedActivity, setSelectedActivity] = useState<object | undefined>();

  const handleClick = useCallback(
    activity => () =>
      setSelectedActivity(prevSelectedActivity => (prevSelectedActivity === activity ? null : activity)),
    [setSelectedActivity]
  );

  const handleKeyDown = useCallback(
    activity => event => {
      if ([' ', 'Enter'].includes(event.key)) {
        handleClick(activity);
      }
    },
    [handleClick]
  );

  const activityMiddleware = useMemo<ActivityMiddleware>(
    () =>
      () =>
      next =>
      card =>
      (...args) => {
        const isSelected = card.activity === selectedActivity;
        const selectedClass = isSelected ? 'selected' : '';
        const label = isSelected ? 'Selected activity. Click to deselect activity.' : 'Click to inspect activity.';
        const result = next(card);

        return (
          <div
            aria-label={label}
            className={`activity-wrapper ${selectedClass}`}
            onClick={handleClick(card.activity)}
            onKeyDown={handleKeyDown(card.activity)}
            role="button"
            tabIndex={0}
          >
            {result && result(...args)}
          </div>
        );
      },
    [handleClick, handleKeyDown, selectedActivity]
  );

  return (
    <div className="app">
      <ReactWebChat activityMiddleware={activityMiddleware} />
      <Inspector inspectedObject={selectedActivity} ref={inspectorRef} />
    </div>
  );
}

export default memo(App);
