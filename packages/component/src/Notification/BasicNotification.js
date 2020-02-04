/* eslint react/no-danger: "off" */

import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import updateIn from 'simple-update-in';

import { useDismissNotification } from '../hooks';
import DismissIcon from './DismissIcon';
import useStyleSet from '../hooks/useStyleSet';
import useInternalMarkdownIt from '../hooks/internal/useInternalMarkdownIt';
import NotificationIcon from './NotificationIcon';
import walkMarkdownTokens from '../Utils/walkMarkdownTokens';

const ROOT_CSS = css({
  display: 'flex',

  '& > .webchat__notification__name': {
    flex: 1
  },

  '& > button': {
    appearance: 'none'
  }
});

function updateMarkdownAttrs(token, updater) {
  return updateIn(token, ['attrs'], attrs => {
    const map = attrs.reduce((map, [name, value]) => ({ ...map, [name]: value }), {});
    const nextMap = updater(map);

    return Object.keys(nextMap).reduce((attrs, key) => [...attrs, [key, nextMap[key]]], []);
  });
}

function addTargetBlankToHyperlinks(markdownTokens) {
  return walkMarkdownTokens(markdownTokens, markdownToken => {
    switch (markdownToken.type) {
      case 'link_open':
        markdownToken = updateMarkdownAttrs(markdownToken, attrs => ({
          ...attrs,
          rel: 'noopener noreferrer',
          target: '_blank'
        }));

        break;

      default:
        break;
    }

    return markdownToken;
  });
}

const Notification = ({ alt, level, message, notificationId, persistent }) => {
  const [{ notification: notificationStyleSet }] = useStyleSet();
  const dismissNotification = useDismissNotification();
  const handleDismissNotification = useCallback(() => {
    dismissNotification(notificationId);
  }, [notificationId]);
  const [markdownIt] = useInternalMarkdownIt();
  const html = useMemo(() => {
    const tree = markdownIt.parseInline(message);
    const updatedTree = addTargetBlankToHyperlinks(tree);

    return { __html: markdownIt.renderer.render(updatedTree) };
  }, [markdownIt, message]);

  return (
    <div
      className={classNames(ROOT_CSS + '', notificationStyleSet + '', {
        'webchat__notification--error': level === 'error',
        'webchat__notification--info': level === 'info',
        'webchat__notification--success': level === 'success',
        'webchat__notification--warn': level === 'warn'
      })}
    >
      <div className="webchat__notification__iconBox">
        <NotificationIcon className="webchat__notification__icon" level={level} />
      </div>
      <div className="webchat__notification__name" dangerouslySetInnerHTML={html} />
      {!persistent && (
        <button className="webchat__notification__dismissButton" onClick={handleDismissNotification} type="button">
          <DismissIcon />
        </button>
      )}
    </div>
  );
};

Notification.propTypes = {
  notification: PropTypes.shape({
    alt: PropTypes.string,
    level: PropTypes.oneOf(['error', 'warn', 'info', 'success']).isRequired,
    message: PropTypes.string.isRequired,
    persistent: PropTypes.bool
  }).isRequired
};

export default Notification;
