// import React, { FC, PropsWithChildren, ReactNode } from 'react';

import { useGetActivityByKey, useSendStatusByActivityKey, useTrackEvent } from '../../hooks';

import usePrevious from '../../hooks/internal/usePrevious';

const ActivitySendStatusTelemetryComposer: React.FC<{ children?: any }> = ({ children }) => {
  const [activityToSendStatusMap] = useSendStatusByActivityKey();
  const previousActivityToSendStatusMap = usePrevious(activityToSendStatusMap);
  const getActivityByKey = useGetActivityByKey();
  const trackEvent = useTrackEvent();

  if (activityToSendStatusMap && previousActivityToSendStatusMap) {
    const allActivityKeys = activityToSendStatusMap.keys();

    for (const key of allActivityKeys) {
      const currentStatus = activityToSendStatusMap.get(key);
      const previousStatus = previousActivityToSendStatusMap.get(key);

      if (!!currentStatus && !!previousStatus && currentStatus !== previousStatus) {
        const activity = getActivityByKey(key);
        const telemetryPayload = {
          currentStatus: currentStatus.toString(),
          previousStatus: previousStatus.toString(),
          clientActivityID: activity?.channelData?.clientActivityID,
          type: activity?.type?.toString()
        };
        trackEvent && trackEvent('send-status:change', telemetryPayload);
      }
    }
  }
  return children;
};

export default ActivitySendStatusTelemetryComposer;
