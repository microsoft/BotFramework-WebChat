import { css } from 'glamor';
import classNames from 'classnames';
import React, { useCallback, useRef, useState, useEffect } from 'react';
import updateIn from 'simple-update-in';

import CollapseIcon from './Notification/CollapseIcon';
import ExpandIcon from './Notification/ExpandIcon';
import useNotifications from './hooks/useNotifications';
import useRenderNotification from './hooks/useRenderNotification';
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

function sortNotifications(map) {
  return Object.keys(map)
    .reduce((array, id) => [...array, map[id]], [])
    .sort(({ timestamp: x }, { timestamp: y }) => x - y);
}

const BasicNotificationBox = () => {
  const now = Date.now();

  const [{ notificationBox: notificationBoxStyleSet }] = useStyleSet();
  const [expanded, setExpanded] = useState(false);
  const [notifications] = useNotifications();
  const [{ notificationDebounceTimeout }] = useStyleOptions();
  const debouncedNotificationsRef = useRef({});
  const renderNotification = useRenderNotification();
  const numNotifications = Object.keys(notifications).length;

  useEffect(() => {
    // TODO: Check if calling setState will cause a re-render
    numNotifications <= 1 && setExpanded(false);
  }, [numNotifications]);

  // debouncedNotificationsRef.current = filterMap(debouncedNotificationsRef.current, ({ nextUpdateAt }) => nextUpdateAt > now);
  // debouncedNotificationsRef.current = updateIn(debouncedNotificationsRef.current, [() => true, 'nextUpdateAt'], nextUpdateAt =>
  //   typeof nextUpdateAt === 'number' ? nextUpdateAt : now + notificationDebounceTimeout
  // );

  forEachMap(notifications, ({ alt, id, level, message, persistent, timestamp }) => {
    debouncedNotificationsRef.current = updateIn(debouncedNotificationsRef.current, [id], debouncedNotification => {
      if (debouncedNotification && now < debouncedNotification.updateNotBefore) {
        return debouncedNotification;
      }

      return {
        ...debouncedNotification,
        alt,
        id,
        level,
        message,
        persistent,
        timestamp,
        updateNotBefore: now + notificationDebounceTimeout * 100
      };
    });
  });

  debouncedNotificationsRef.current = filterMap(
    debouncedNotificationsRef.current,
    ({ id, updateNotBefore }) => notifications[id] || Date.now() < updateNotBefore
  );

  const { updateNotBefore: earliestUpdateNotBefore } =
    minOfMap(debouncedNotificationsRef.current, ({ updateNotBefore }) => updateNotBefore) || {};

  const [, setForceRefresh] = useState();

  useTimer(earliestUpdateNotBefore, () => setForceRefresh({}));

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
    notificationDebounceTimeout,
    earliestUpdateNotBefore,
    timeToRefresh: earliestUpdateNotBefore - now
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
            {renderNotification({ alt, id, level, message, persistent })}
            {/* <Notification alt={alt} level={level} message={message} notificationId={id} persistent={persistent} /> */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BasicNotificationBox;
