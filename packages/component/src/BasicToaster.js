/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2, 3, 4, 5] }] */
/* eslint react/forbid-dom-props: "off" */

import { css } from 'glamor';
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import CollapseIcon from './Toast/CollapseIcon';
import ExpandIcon from './Toast/ExpandIcon';
import NotificationIcon from './Toast/NotificationIcon';
import randomId from './Utils/randomId';
import useDebouncedNotifications from './hooks/useDebouncedNotifications';
import useLocalizer from './hooks/useLocalizer';
import useRenderToast from './hooks/useRenderToast';
import useStyleSet from './hooks/useStyleSet';

const ROOT_CSS = css({
  display: 'flex',
  flexDirection: 'column',

  '& .webchat__toaster__header': {
    display: 'flex',
    flexShrink: 0
  },

  '& .webchat__toaster__expandText': {
    flex: 1
  },

  '& .webchat__toaster__list': {
    display: 'block',
    listStyleType: 'none'
  }
});

const LEVEL_AS_NUMBER = {
  error: 1,
  warn: 2,
  info: 3,
  success: 4
};

function getLevelAsNumber(level) {
  return LEVEL_AS_NUMBER[level] || 5;
}

function compareLevel(x, y) {
  return getLevelAsNumber(x) - getLevelAsNumber(y);
}

function sortNotifications(map) {
  return (
    Object.values(map)
      // We want the order reversed, most recent on top.
      .sort(({ timestamp: x }, { timestamp: y }) => y - x)
  );
}

const PASSTHRU_FN = value => value;
const TOAST_ACCORDION_IDS = {
  two: 'TOAST_ACCORDION_TWO',
  few: 'TOAST_ACCORDION_FEW',
  many: 'TOAST_ACCORDION_MANY',
  other: 'TOAST_ACCORDION_OTHER'
};

const BasicToaster = () => {
  const instanceId = useMemo(randomId, []);
  const [{ toaster: toasterStyleSet }] = useStyleSet();
  const [debouncedNotifications] = useDebouncedNotifications();
  const [expanded, setExpanded] = useState(false);
  const localizeWithPlural = useLocalizer({ plural: true });
  const renderToast = useRenderToast();

  const handleToggleExpand = useCallback(() => setExpanded(!expanded), [expanded, setExpanded]);
  const sortedNotifications = useMemo(() => sortNotifications(debouncedNotifications), [debouncedNotifications]);
  const sortedNotificationsWithChildren = useMemo(
    () =>
      sortedNotifications
        .map(notification => {
          const children = renderToast({ notification });

          return children && { children, notification };
        })
        .filter(PASSTHRU_FN),
    [renderToast, sortedNotifications]
  );

  const expandable = sortedNotificationsWithChildren.length > 1;
  const [highestLevel] = sortedNotificationsWithChildren.map(({ notification: { level } }) => level).sort(compareLevel);

  const expandableElementId = useMemo(
    () => (!expandable || expanded ? `webchat__toaster__list__${instanceId}` : undefined),
    [expandable, expanded, instanceId]
  );
  const headerElementId = useMemo(() => (expandable ? `webchat__toaster__header__${instanceId}` : undefined), [
    expandable,
    instanceId
  ]);

  useEffect(() => {
    !expandable && setExpanded(false);
  }, [expandable]);

  return (
    <div
      aria-labelledby={headerElementId}
      aria-live="polite"
      aria-relevant="all"
      className={classNames(ROOT_CSS + '', toasterStyleSet + '', 'webchat__toaster', {
        'webchat__toaster--expandable': expandable,
        'webchat__toaster--expanded': expanded,
        'webchat__toaster--error': highestLevel === 'error',
        'webchat__toaster--info': highestLevel === 'info',
        'webchat__toaster--success': highestLevel === 'success',
        'webchat__toaster--warn': highestLevel === 'warn'
      })}
      role="log"
    >
      {expandable && (
        <button
          aria-controls={expandableElementId}
          aria-expanded={expanded}
          className="webchat__toaster__header"
          id={headerElementId}
          onClick={handleToggleExpand}
          type="button"
        >
          <div aria-hidden={true} className="webchat__toaster__expandLevelIconBox">
            <NotificationIcon className="webchat__toaster__expandLevelIcon" level={highestLevel} />
          </div>
          <div className="webchat__toaster__expandText">
            {localizeWithPlural(TOAST_ACCORDION_IDS, sortedNotificationsWithChildren.length)}
          </div>
          <div aria-hidden={true} className="webchat__toaster__expandIcon">
            <div className="webchat__toaster__expandIconFocus">{expanded ? <CollapseIcon /> : <ExpandIcon />}</div>
          </div>
        </button>
      )}
      {(!expandable || expanded) && (
        <ul aria-labelledby={headerElementId} className="webchat__toaster__list" id={expandableElementId} role="region">
          {sortedNotificationsWithChildren.map(({ children, notification: { id } }) => (
            <li aria-atomic={true} className="webchat__toaster__listItem" key={id} role="none">
              {children}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BasicToaster;
