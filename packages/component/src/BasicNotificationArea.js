/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2, 3] }] */

import { css } from 'glamor';
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import CollapseIcon from './Notification/CollapseIcon';
import ExpandIcon from './Notification/ExpandIcon';
import NotificationIcon from './Notification/NotificationIcon';
import random from 'math-random';
import useDebouncedNotifications from './hooks/useDebouncedNotifications';
import useLocalize from './hooks/useLocalize';
import useRenderNotification from './hooks/useRenderNotification';
import useStyleSet from './hooks/useStyleSet';

const ROOT_CSS = css({
  display: 'flex',
  flexDirection: 'column',

  '&.webchat__notificationArea': {
    display: 'flex',
    flexDirection: 'column'
  },

  '& .webchat__notificationArea__expander': {
    display: 'flex',
    flexShrink: 0
  },

  '& .webchat__notificationArea__expandText': {
    flex: 1
  },

  '& .webchat__notificationArea__list': {
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
      return 3;

    default:
      return 4;
  }
}

function compareLevel(x, y) {
  return getLevelAsNumber(x) - getLevelAsNumber(y);
}

function sortNotifications(map) {
  return (
    Object.keys(map)
      .reduce((array, id) => [...array, map[id]], [])
      // We want the order reversed, most recent on top.
      .sort(({ timestamp: x }, { timestamp: y }) => y - x)
  );
}

const BasicNotificationArea = () => {
  const [{ notificationArea: notificationAreaStyleSet }] = useStyleSet();
  const [debouncedNotifications] = useDebouncedNotifications();
  const [expanded, setExpanded] = useState(false);
  const notificationExpandText = useLocalize('NOTIFICATION_EXPAND_TEXT') || '';
  const renderNotification = useRenderNotification();

  const sortedNotifications = useMemo(() => sortNotifications(debouncedNotifications), [debouncedNotifications]);
  const sortedNotificationsWithChildren = useMemo(
    () =>
      sortedNotifications
        .map(notification => {
          const children = renderNotification({ notification });

          return children && { children, notification };
        })
        .filter(entry => entry),
    [renderNotification, sortedNotifications]
  );
  const expandable = sortedNotificationsWithChildren.length > 1;

  useEffect(() => {
    !expandable && setExpanded(false);
  }, [expandable]);

  const handleToggleExpand = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded, setExpanded]);

  const [highestLevel] = sortedNotificationsWithChildren.map(({ notification: { level } }) => level).sort(compareLevel);
  const expanderId = useMemo(
    () =>
      `webchat__notificationArea__expander__${random()
        .toString(36)
        .substr(2, 5)}`,
    []
  );
  const expandableId = useMemo(
    () =>
      `webchat__notificationArea__list__${random()
        .toString(36)
        .substr(2, 5)}`,
    []
  );

  return (
    <div
      aria-labelledby={expanderId}
      aria-live="polite"
      aria-relevant="additions text"
      className={classNames(ROOT_CSS + '', notificationAreaStyleSet + '', 'webchat__notificationArea', {
        'webchat__notificationArea--expandable': expandable,
        'webchat__notificationArea--expanded': expanded,
        'webchat__notificationArea--error': highestLevel === 'error',
        'webchat__notificationArea--info': highestLevel === 'info',
        'webchat__notificationArea--success': highestLevel === 'success',
        'webchat__notificationArea--warn': highestLevel === 'warn'
      })}
      role="log"
    >
      {expandable && (
        <button
          aria-controls={expandableId}
          aria-expanded={expanded}
          className="webchat__notificationArea__expander"
          id={expanderId}
          onClick={handleToggleExpand}
          type="button"
        >
          <div aria-hidden={true} className="webchat__notificationArea__expandLevelIconBox">
            <NotificationIcon className="webchat__notificationArea__expandLevelIcon" level={highestLevel} />
          </div>
          <div className="webchat__notificationArea__expandText">
            {notificationExpandText.replace('$1', sortedNotificationsWithChildren.length)}
          </div>
          <div aria-hidden={true} className="webchat__notificationArea__expandIcon">
            <div className="webchat__notificationArea__expandIconFocus">
              {expanded ? <CollapseIcon /> : <ExpandIcon />}
            </div>
          </div>
        </button>
      )}
      {(!expandable || expanded) && (
        <ul aria-labelledby={expanderId} className="webchat__notificationArea__list" id={expandableId} role="region">
          {sortedNotificationsWithChildren.map(({ children, notification: { id } }) => (
            <li className="webchat__notificationArea__listItem" key={id} role="none">
              {children}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BasicNotificationArea;
