import PropTypes from 'prop-types';
import React from 'react';

import { Constants } from 'botframework-webchat-core';

import SendStatus from './SendStatus';
import Timestamp from './Timestamp';
import useGroupTimestamp from '../../hooks/useGroupTimestamp';

const {
  ActivityClientState: { SENDING, SEND_FAILED }
} = Constants;

const DEFAULT_GROUP_TIMESTAMP = 300000; // 5 minutes

function sameTimestampGroup(activityX, activityY, groupTimestamp) {
  if (groupTimestamp === false) {
    return true;
  } else if (activityX && activityY) {
    groupTimestamp = typeof groupTimestamp === 'number' ? groupTimestamp : DEFAULT_GROUP_TIMESTAMP;

    if (activityX.from.role === activityY.from.role) {
      const timeX = new Date(activityX.timestamp).getTime();
      const timeY = new Date(activityY.timestamp).getTime();

      return Math.abs(timeX - timeY) <= groupTimestamp;
    }
  }

  return false;
}

export default function createCoreMiddleware() {
  return () => () => {
    const ActivityStatus = ({ activity, nextActivity }) => {
      const { channelData: { state } = {} } = activity;
      const [groupTimestamp] = useGroupTimestamp();

      return state === SENDING || state === SEND_FAILED ? (
        <SendStatus activity={activity} />
      ) : (
        !sameTimestampGroup(activity, nextActivity, groupTimestamp) && <Timestamp activity={activity} />
      );
    };

    ActivityStatus.propTypes = {
      activity: PropTypes.shape({
        channelData: PropTypes.shape({
          state: PropTypes.string
        }),
        from: PropTypes.shape({
          role: PropTypes.string.isRequired
        }).isRequired,
        timestamp: PropTypes.string.isRequired
      }).isRequired,
      nextActivity: PropTypes.any.isRequired
    };

    return ActivityStatus;
  };
}
