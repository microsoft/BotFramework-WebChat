import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import { isForbiddenPropertyName } from 'botframework-webchat-core';
import React from 'react';
import { object, optional, picklist, pipe, readonly, string } from 'valibot';

import CheckMarkIcon from './CheckMarkIcon';
import ExclamationMarkIcon from './ExclamationMarkIcon';

const { useLocalizer } = hooks;

const notificationIconPropsSchema = pipe(
  object({
    className: optional(string()),
    level: picklist(['error', 'info', 'success', 'warn'])
  }),
  readonly()
);

const NotificationIcon = props => {
  const { className, level } = validateProps(notificationIconPropsSchema, props);

  const localize = useLocalizer();

  const prefixes = {
    error: localize('TOAST_ALT_ERROR'),
    info: localize('TOAST_ALT_INFO'),
    success: localize('TOAST_ALT_SUCCESS'),
    warn: localize('TOAST_ALT_WARN')
  };

  // Mitigated through denylisting.
  // eslint-disable-next-line security/detect-object-injection
  const prefix = (!isForbiddenPropertyName(level) && prefixes[level]) || '';

  return (
    <React.Fragment>
      {level === 'success' ? (
        <CheckMarkIcon aria-label={prefix} className={className} />
      ) : (
        <ExclamationMarkIcon aria-label={prefix} className={className} />
      )}
    </React.Fragment>
  );
};

export default NotificationIcon;
