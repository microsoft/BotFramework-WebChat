/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2, 3, 4, 5] }] */
/* eslint react/forbid-dom-props: "off" */

import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React, { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import CollapseIcon from './Toast/CollapseIcon';
import ExpandIcon from './Toast/ExpandIcon';
import NotificationIcon from './Toast/NotificationIcon';
import randomId from './Utils/randomId';
import renderMarkdownInline from './private/renderMarkdownInline';
import { useLiveRegion } from './providers/LiveRegionTwin';

import styles from './Toast/Toast.module.css';

const { useDebouncedNotifications, useLocalizer, useRenderToast } = hooks;

const LEVEL_AS_NUMBER = {
  error: 1,
  warn: 2,
  info: 3,
  success: 4
};

const LEVEL_AS_NUMBER_KEYS = Object.keys(LEVEL_AS_NUMBER);

function getLevelAsNumber(level) {
  // Mitigated through allowlisting.
  // eslint-disable-next-line security/detect-object-injection
  return LEVEL_AS_NUMBER_KEYS.includes(level) ? LEVEL_AS_NUMBER[level] : 5;
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

const BasicToaster = ({ className }) => {
  const instanceId = useMemo(() => randomId(), []);
  // Keeps the "webchat__toaster" class names.
  const classNames = useStyles(styles, webChatPrefixedClassName);
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
  const headerElementId = useMemo(
    () => (expandable ? `webchat__toaster__header__${instanceId}` : undefined),
    [expandable, instanceId]
  );

  useEffect(() => {
    // TODO: [P2] Intentionally set error, we will visit it later.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    !expandable && setExpanded(false);
  }, [expandable]);

  const notifiedElements = useRef(new Set());

  useLiveRegion(() => {
    const toAnnounce = [];

    // Announce only rendered toasts, not hidden notifications such as the connectivity status.
    for (const { notification } of sortedNotificationsWithChildren.slice().reverse()) {
      if (!notifiedElements.current.has(notification.id)) {
        notifiedElements.current.add(notification.id);

        toAnnounce.push(
          notification.alt ? (
            <div aria-atomic={true} className="webchat__toaster__notifications" key={notification.id}>
              {notification.alt}
            </div>
          ) : (
            <div
              aria-atomic={true}
              className="webchat__toaster__notifications"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: renderMarkdownInline(notification.message ?? '')
              }}
              key={notification.id}
            />
          )
        );
      }
    }

    return toAnnounce.length > 0 && <Fragment>{toAnnounce}</Fragment>;
  }, [sortedNotificationsWithChildren]);

  return (
    <div
      aria-labelledby={headerElementId}
      aria-relevant="all"
      className={cx(
        classNames['toaster'],
        {
          [classNames['toaster--expandable']]: expandable,
          [classNames['toaster--expanded']]: expanded,
          [classNames['toaster--error']]: highestLevel === 'error',
          [classNames['toaster--info']]: highestLevel === 'info',
          [classNames['toaster--success']]: highestLevel === 'success',
          [classNames['toaster--warn']]: highestLevel === 'warn'
        },
        className
      )}
      role="log"
    >
      {expandable && (
        <button
          aria-controls={expandableElementId}
          aria-expanded={expanded}
          className={classNames['toaster__header']}
          id={headerElementId}
          onClick={handleToggleExpand}
          type="button"
        >
          <div aria-hidden={true} className={classNames['toaster__expandLevelIconBox']}>
            <NotificationIcon className="webchat__toaster__expandLevelIcon" level={highestLevel} />
          </div>
          <div className={classNames['toaster__expandText']}>
            {localizeWithPlural(TOAST_ACCORDION_IDS, sortedNotificationsWithChildren.length)}
          </div>
          <div aria-hidden={true} className={classNames['toaster__expandIcon']}>
            <div className={classNames['toaster__expandIconFocus']}>{expanded ? <CollapseIcon /> : <ExpandIcon />}</div>
          </div>
        </button>
      )}
      {(!expandable || expanded) && (
        <div className={classNames['toaster__list']} id={expandableElementId}>
          {sortedNotificationsWithChildren.map(({ children, notification: { id } }) => (
            <div className={classNames['toaster__listItem']} key={id}>
              {children}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

BasicToaster.displayName = 'BasicToaster';

export default memo(BasicToaster);
