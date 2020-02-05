/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2, 3] }] */

import { css } from 'glamor';
import classNames from 'classnames';
import React, { useCallback, useRef, useState, useEffect } from 'react';
import updateIn from 'simple-update-in';

import CollapseIcon from './Notification/CollapseIcon';
import ExpandIcon from './Notification/ExpandIcon';
import NotificationIcon from './Notification/NotificationIcon';
import useNotifications from './hooks/useNotifications';
import useRenderNotification from './hooks/useRenderNotification';
import useStyleOptions from './hooks/useStyleOptions';
import useStyleSet from './hooks/useStyleSet';
import useTimer from './hooks/internal/useTimer';

function isUndefined(obj) {
  return typeof obj === 'undefined';
}

const DEFAULT_SELECTOR = value => value;

const ROOT_CSS = css({
  display: 'flex',
  flexDirection: 'column',

  '& .webchat__notificationBox__accordion': {
    display: 'flex',
    flexDirection: 'column'
  },

  '& .webchat__notificationBox__expander': {
    display: 'flex',
    flexShrink: 0
  },

  '& .webchat__notificationBox__expandText': {
    flex: 1
  },

  '& .webchat__notificationBox__list': {
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
  for (const key in map) {
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

  // In some cases, notification may not disappear.
  debouncedNotificationsRef.current = filterMap(
    debouncedNotificationsRef.current,
    ({ id, updateNotBefore }) => notifications[id] || now < updateNotBefore
  );

  forEachMap(notifications, ({ alt, id, level, message, persistent, timestamp }) => {
    debouncedNotificationsRef.current = updateIn(debouncedNotificationsRef.current, [id], debouncedNotification => {
      if (
        debouncedNotification &&
        alt === debouncedNotification.alt &&
        level === debouncedNotification.level &&
        message === debouncedNotification.message &&
        persistent === debouncedNotification.persistent &&
        timestamp === debouncedNotification.timestamp
      ) {
        return debouncedNotification;
      }

      if (debouncedNotification && now <= debouncedNotification.updateNotBefore) {
        return {
          ...debouncedNotification,
          outOfDate: true
        };
      }

      return {
        ...debouncedNotification,
        alt,
        id,
        level,
        message,
        outOfDate: false,
        persistent,
        timestamp,
        updateNotBefore: now + notificationDebounceTimeout
      };
    });
  });

  const { updateNotBefore: earliestUpdateNotBefore } =
    minOfMap(
      filterMap(debouncedNotificationsRef.current, ({ outOfDate }) => outOfDate),
      ({ updateNotBefore }) => updateNotBefore
    ) || {};

  const [, setForceRefresh] = useState();
  const forceRefresh = useCallback(() => setForceRefresh({}), [setForceRefresh]);

  useTimer(earliestUpdateNotBefore, forceRefresh);

  const sortedNotifications = sortNotifications(debouncedNotificationsRef.current);
  const persistedNotifications = sortedNotifications.filter(({ persistent }) => persistent);
  const temporalNotifications = sortedNotifications.filter(({ persistent }) => !persistent);
  const expandable = temporalNotifications.length > 1;
  const handleToggleExpand = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded, setExpanded]);
  const [highestLevel] = temporalNotifications.map(({ level }) => level).sort(compareLevel);

  // TODO: [P3] Optimize the "expanded" state, so we don't need to call "setExpanded" that would cause re-render.
  useEffect(() => {
    !expandable && setExpanded(false);
  }, [expandable]);

  console.group('BasicNotifications render');
  console.log({
    highestLevel,
    notifications,
    debouncedNotifications: debouncedNotificationsRef.current,
    notificationDebounceTimeout,
    earliestUpdateNotBefore,
    timeToRefresh: now - earliestUpdateNotBefore
  });
  console.groupEnd();

  return (
    <div className={classNames(ROOT_CSS + '', notificationBoxStyleSet + '')} role="log">
      <ul className="webchat__notificationBox__list">
        {persistedNotifications.map(({ alt, id, level, message, persistent }) => (
          <li className="webchat__notificationBox__listItem" key={id}>
            {renderNotification({ notification: { alt, id, level, mFessage, persistent } })}
          </li>
        ))}
      </ul>
      <div
        className={classNames('webchat__notificationBox__accordion', {
          'webchat__notificationBox__accordion--expandable': expandable,
          'webchat__notificationBox__accordion--expanded': expanded,
          'webchat__notificationBox__accordion--error': highestLevel === 'error',
          'webchat__notificationBox__accordion--info': highestLevel === 'info',
          'webchat__notificationBox__accordion--success': highestLevel === 'success',
          'webchat__notificationBox__accordion--warn': highestLevel === 'warn'
        })}
      >
        {expandable && (
          <button className="webchat__notificationBox__expander" onClick={handleToggleExpand} type="button">
            <div className="webchat__notificationBox__expandLevelIconBox">
              <NotificationIcon className="webchat__notificationBox__expandLevelIcon" level={highestLevel} />
            </div>
            <div className="webchat__notificationBox__expandText">
              {temporalNotifications.length}
              {' Notifications: Click here to see details'}
            </div>
            <div className="webchat__notificationBox__expandIcon">{expanded ? <CollapseIcon /> : <ExpandIcon />}</div>
          </button>
        )}
        <ul className="webchat__notificationBox__list">
          {temporalNotifications.map(({ alt, id, level, message, persistent }) => (
            <li className="webchat__notificationBox__listItem" key={id}>
              {renderNotification({ notification: { alt, id, level, message, persistent } })}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BasicNotificationBox;
