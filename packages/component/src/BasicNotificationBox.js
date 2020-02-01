import { css } from 'glamor';
import classNames from 'classnames';
import React, { useCallback, useRef, useState, useEffect } from 'react';
import updateIn from 'simple-update-in';

import CollapseIcon from './Notification/CollapseIcon';
import ExpandIcon from './Notification/ExpandIcon';
import Notification from './Notification/Notification';
import useNotifications from './hooks/useNotifications';
import useStyleOptions from './hooks/useStyleOptions';
import useStyleSet from './hooks/useStyleSet';
import useTimer from './hooks/internal/useTimer';
import NotificationIcon from './Notification/NotificationIcon';

function isUndefined(obj) {
  return typeof obj === 'undefined';
}

const DEFAULT_SELECTOR = value => value;

const ROOT_CSS = css({
  display: 'flex',
  flexDirection: 'column',

  '& button.webchat__notificationBox__expander': {
    display: 'flex',
    flexShrink: 0,
    textAlign: 'initial'
  },

  '& .webchat__notificationBox__expandText': {
    flex: 1
  },

  '& > ul': {
    display: 'flex',
    flexDirection: 'column',
    listStyleType: 'none'
  }
});

function getLevelAsNumber(level) {
  switch (level) {
    case 'error':
      return 0;

    case 'warn':
      return 1;

    case 'info':
      return 2;

    case 'success':
    default:
      return 3;
  }
}

function compareLevel(x, y) {
  return getLevelAsNumber(x) - getLevelAsNumber(y);
}

function minOf(array, selector = DEFAULT_SELECTOR) {
  return array.reduce((minValue, value) => {
    const minScore = isUndefined(minValue) ? minValue : selector(minValue);
    const score = isUndefined(value) ? value : selector(value);

    if (isUndefined(minScore)) {
      return value;
    } else if (isUndefined(score)) {
      return minValue;
    }

    return minScore < score ? minValue : value;
  }, undefined);
}

function minOfMap(map, selector = DEFAULT_SELECTOR) {
  const minKey = minOf(Object.keys(map), key => selector.call(map, map[key], key));

  return minKey && map[minKey];
}

function filterMap(map, predicate) {
  return Object.keys(map).reduce((nextMap, key) => {
    const value = map[key];

    if (predicate.call(map, value, key)) {
      nextMap[key] = value;
    }

    return nextMap;
  }, {});
}

function forEachMap(map, iterator) {
  for (let key in map) {
    iterator.call(map, map[key], key);
  }
}

function mapMap(map, mapper) {
  return Object.keys(map).map(key => mapper.call(map, map[key], key));
}

function sortNotifications(map) {
  return Object.keys(map)
    .reduce((array, id) => [...array, map[id]], [])
    .sort(({ timestamp: x }, { timestamp: y }) => x - y);
}

const BasicNotificationBox = () => {
  const now = Date.now();

  const [{ notificationBox: notificationBoxStyleSet }] = useStyleSet();
  const debouncedNotificationsRef = useRef({});
  const [notifications] = useNotifications();
  const { notificationDebounceTimeout } = useStyleOptions();
  const [expanded, setExpanded] = useState(false);
  const numNotifications = Object.keys(notifications).length;

  useEffect(() => {
    // TODO: Check if calling setState will cause a re-render
    numNotifications <= 1 && setExpanded(false);
  }, [numNotifications]);

  debouncedNotificationsRef.current = filterMap(debouncedNotificationsRef.current, ({ removeAt }) => removeAt > now);
  debouncedNotificationsRef.current = updateIn(debouncedNotificationsRef.current, [() => true, 'removeAt'], removeAt =>
    typeof removeAt === 'number' ? removeAt : now + notificationDebounceTimeout
  );

  forEachMap(notifications, ({ alt, id, level, message, persistent, timestamp }) => {
    debouncedNotificationsRef.current = updateIn(debouncedNotificationsRef.current, [id], debouncedNotification => ({
      ...debouncedNotification,
      alt,
      id,
      level,
      message,
      persistent,
      removeAt: undefined,
      timestamp
    }));
  });

  const { removeAt: nextRemoveAt } = minOfMap(debouncedNotificationsRef.current, ({ removeAt }) => removeAt) || {};

  const [, setForceRefresh] = useState();

  useTimer(nextRemoveAt, () => setForceRefresh({}));

  const sortedNotifications = sortNotifications(debouncedNotificationsRef.current);
  const expandable = sortedNotifications.length > 1;
  const handleToggleExpand = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded, setExpanded]);
  const highestLevel = sortedNotifications.map(({ level }) => level).sort(compareLevel)[0];

  console.group('BasicNotifications render');
  console.log({
    highestLevel,
    notifications,
    debouncedNotifications: debouncedNotificationsRef.current,
    nextRemoveAt,
    timeToRefresh: nextRemoveAt - now
  });
  console.groupEnd();

  return (
    <div
      className={classNames(ROOT_CSS + '', notificationBoxStyleSet + '', {
        'webchat__notificationBox--error': highestLevel === 'error',
        'webchat__notificationBox--expandable': expandable,
        'webchat__notificationBox--expanded': expanded,
        'webchat__notificationBox--info': highestLevel === 'info',
        'webchat__notificationBox--success': highestLevel === 'success',
        'webchat__notificationBox--warn': highestLevel === 'warn'
      })}
      role="log"
    >
      {expandable && (
        <button className="webchat__notificationBox__expander" onClick={handleToggleExpand} type="button">
          <div className="webchat__notificationBox__expandLevelIconBox">
            <NotificationIcon className="webchat__notificationBox__expandLevelIcon" level={highestLevel} />
          </div>
          <div className="webchat__notificationBox__expandText">
            {sortedNotifications.length} Notifications: Click here to see details
          </div>
          <div className="webchat__notificationBox__expandIcon">{expanded ? <CollapseIcon /> : <ExpandIcon />}</div>
        </button>
      )}
      <ul>
        {sortedNotifications.map(({ alt, id, level, message, persistent }) => (
          <li key={id}>
            <Notification alt={alt} level={level} message={message} notificationId={id} persistent={persistent} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BasicNotificationBox;
