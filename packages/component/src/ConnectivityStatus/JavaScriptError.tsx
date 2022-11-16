import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { useMemo } from 'react';

import ErrorNotificationIcon from './Assets/ErrorNotificationIcon';
import useQueueStaticElement from '../providers/LiveRegionTwin/useQueueStaticElement';
import useStyleSet from '../hooks/useStyleSet';

import type { FC } from 'react';

const { useDirection, useLocalizer } = hooks;

const ConnectivityStatusJavaScriptError: FC<{}> = () => {
  const [{ errorNotification: errorNotificationStyleSet }] = useStyleSet();
  const [direction] = useDirection();
  const localize = useLocalizer();
  const queueStaticElement = useQueueStaticElement();

  const renderErrorNotificationText = localize('CONNECTIVITY_STATUS_ALT_RENDER_ERROR');

  const renderErrorNotificationAlt = localize('CONNECTIVITY_STATUS_ALT', renderErrorNotificationText);

  useMemo(() => queueStaticElement(renderErrorNotificationAlt), [queueStaticElement, renderErrorNotificationAlt]);

  return (
    <div
      aria-hidden={true}
      className={classNames('webchat__connectivityStatus', errorNotificationStyleSet + '')}
      dir={direction}
    >
      <ErrorNotificationIcon />
      {renderErrorNotificationText}
    </div>
  );
};

export default ConnectivityStatusJavaScriptError;
