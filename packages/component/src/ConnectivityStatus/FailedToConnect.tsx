import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { useMemo } from 'react';

import ErrorNotificationIcon from './Assets/ErrorNotificationIcon';
import useQueueStaticElement from '../providers/LiveRegionTwin/useQueueStaticElement';
import useStyleSet from '../hooks/useStyleSet';

import type { FC } from 'react';

const { useDirection, useLocalizer } = hooks;

const ConnectivityStatusFailedToConnect: FC<{}> = () => {
  const [{ errorNotification: errorNotificationStyleSet }] = useStyleSet();
  const [direction] = useDirection();
  const localize = useLocalizer();
  const queueStaticElement = useQueueStaticElement();

  const failedConnectionText = localize('CONNECTIVITY_STATUS_ALT', localize('CONNECTIVITY_STATUS_ALT_FATAL'));

  const failedConnectionAlt = localize('CONNECTIVITY_STATUS_ALT', failedConnectionText);

  useMemo(() => queueStaticElement(failedConnectionAlt), [failedConnectionAlt, queueStaticElement]);

  return (
    <div
      aria-hidden={true}
      className={classNames('webchat__connectivityStatus', errorNotificationStyleSet + '')}
      dir={direction}
    >
      <ErrorNotificationIcon />
      {failedConnectionText}
    </div>
  );
};

export default ConnectivityStatusFailedToConnect;
