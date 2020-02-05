/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2, 3] }] */

import { css } from 'glamor';
import classNames from 'classnames';
import React, { useCallback, useMemo, useState, useEffect } from 'react';

import CollapseIcon from './Notification/CollapseIcon';
import ExpandIcon from './Notification/ExpandIcon';
import NotificationIcon from './Notification/NotificationIcon';
import useDebouncedNotifications from './hooks/useDebouncedNotifications';
import useRenderNotification from './hooks/useRenderNotification';
import useStyleSet from './hooks/useStyleSet';

const ROOT_CSS = css({
  display: 'flex',
  flexDirection: 'column',

  '&.webchat__notificationBar': {
    display: 'flex',
    flexDirection: 'column'
  },

  '& .webchat__notificationBar__expander': {
    display: 'flex',
    flexShrink: 0
  },

  '& .webchat__notificationBar__expandText': {
    flex: 1
  },

  '& .webchat__notificationBar__list': {
    display: 'block',
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

function sortNotifications(map) {
  return Object.keys(map)
    .reduce((array, id) => [...array, map[id]], [])
    .sort(({ timestamp: x }, { timestamp: y }) => x - y);
}

const BasicNotificationBar = () => {
  const [{ notificationBar: notificationBarStyleSet }] = useStyleSet();
  const [expanded, setExpanded] = useState(false);
  const [debouncedNotifications] = useDebouncedNotifications();
  const renderNotification = useRenderNotification();

  const sortedNotifications = useMemo(() => sortNotifications(debouncedNotifications), [debouncedNotifications]);
  const sortedNotificationsWithChildren = useMemo(() => {
    return sortedNotifications
      .map(notification => {
        const children = renderNotification({ notification });

        return children && { children, notification };
      })
      .filter(entry => entry);
  }, [sortedNotifications]);
  const expandable = sortedNotificationsWithChildren.length > 1;
  const handleToggleExpand = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded, setExpanded]);
  const [highestLevel] = sortedNotificationsWithChildren.map(({ notification: { level } }) => level).sort(compareLevel);

  // TODO: [P3] Optimize the "expanded" state, so we don't need to call "setExpanded" that would cause re-render.
  useEffect(() => {
    !expandable && setExpanded(false);
  }, [expandable]);

  return (
    <div
      className={classNames(ROOT_CSS + '', notificationBarStyleSet + '', 'webchat__notificationBar', {
        'webchat__notificationBar--expandable': expandable,
        'webchat__notificationBar--expanded': expanded,
        'webchat__notificationBar--error': highestLevel === 'error',
        'webchat__notificationBar--info': highestLevel === 'info',
        'webchat__notificationBar--success': highestLevel === 'success',
        'webchat__notificationBar--warn': highestLevel === 'warn'
      })}
      role="log"
    >
      {expandable && (
        <button className="webchat__notificationBar__expander" onClick={handleToggleExpand} type="button">
          <div aria-hidden={true} className="webchat__notificationBar__expandLevelIconBox">
            <NotificationIcon className="webchat__notificationBar__expandLevelIcon" level={highestLevel} />
          </div>
          <div className="webchat__notificationBar__expandText">
            {sortedNotificationsWithChildren.length}
            {' Notifications: Click here to see details'}
          </div>
          <div aria-hidden={true} className="webchat__notificationBar__expandIcon">
            {expanded ? <CollapseIcon /> : <ExpandIcon />}
          </div>
        </button>
      )}
      <ul className="webchat__notificationBar__list">
        {sortedNotificationsWithChildren.map(({ children, notification: { id } }) => (
          <li className="webchat__notificationBar__listItem" key={id}>
            {children}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BasicNotificationBar;
