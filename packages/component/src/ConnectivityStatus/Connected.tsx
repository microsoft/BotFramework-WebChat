import { hooks } from 'botframework-webchat-api';
import { useMemo } from 'react';

import useQueueStaticElement from '../providers/LiveRegionTwin/useQueueStaticElement';

import type { FC } from 'react';

const { useLocalizer } = hooks;

const ConnectivityStatusConnected: FC<{}> = () => {
  const localize = useLocalizer();
  const queueStaticElement = useQueueStaticElement();

  const connectedAlt = localize('CONNECTIVITY_STATUS_ALT', localize('CONNECTIVITY_STATUS_ALT_CONNECTED'));

  useMemo(() => queueStaticElement(connectedAlt), [connectedAlt, queueStaticElement]);

  return null;
};

export default ConnectivityStatusConnected;
