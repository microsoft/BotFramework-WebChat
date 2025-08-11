import { hooks } from 'botframework-webchat-api';
import {
  getOrgSchemaMessage,
  OrgSchemaProject,
  parseAction,
  parseClaim,
  warnOnce,
  type WebChatActivity
} from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo, useMemo } from 'react';

import ActivityFeedback from '../ActivityFeedback/ActivityFeedback';
import useStyleSet from '../hooks/useStyleSet';
import dereferenceBlankNodes from '../Utils/JSONLinkedData/dereferenceBlankNodes';
import Originator from './private/Originator';
import StatusSlot from './StatusSlot';
import Timestamp from './Timestamp';

const { useStyleOptions } = hooks;

type Props = Readonly<{ activity: WebChatActivity; className?: string | undefined }>;

const warnRootLevelThings = warnOnce(
  'Root-level things are being deprecated, please relate all things to `entities[@id=""]` instead. This feature will be removed in 2025-03-06.'
);

const OthersActivityStatus = memo(({ activity, className }: Props) => {
  const [{ feedbackActionsPlacement }] = useStyleOptions();
  const [{ sendStatus }] = useStyleSet();
  const { timestamp } = activity;
  const graph = useMemo(() => dereferenceBlankNodes(activity.entities || []), [activity.entities]);

  const messageThing = useMemo(() => getOrgSchemaMessage(graph), [graph]);

  const claimInterpreter = useMemo<OrgSchemaProject | undefined>(() => {
    try {
      if (messageThing) {
        return parseClaim((messageThing?.citation || [])[0])?.claimInterpreter;
      }

      const [firstClaim] = graph.filter(({ type }) => type === 'https://schema.org/Claim').map(parseClaim);

      if (firstClaim) {
        warnRootLevelThings();

        return firstClaim?.claimInterpreter;
      }

      const replyAction = parseAction(graph.find(({ type }) => type === 'https://schema.org/ReplyAction'));

      if (replyAction) {
        warnRootLevelThings();

        return replyAction?.provider;
      }
    } catch {
      // Intentionally left blank.
    }
  }, [graph, messageThing]);

  return (
    <span className={classNames('webchat__activity-status', className, sendStatus + '')}>
      {timestamp && (
        <StatusSlot>
          <Timestamp key="timestamp" timestamp={timestamp} />
        </StatusSlot>
      )}
      {claimInterpreter && (
        <StatusSlot>
          <Originator key="originator" project={claimInterpreter} />
        </StatusSlot>
      )}
      {feedbackActionsPlacement === 'activity-status' && (
        <StatusSlot>
          <ActivityFeedback activity={activity} key="feedback" />
        </StatusSlot>
      )}
    </span>
  );
});

OthersActivityStatus.displayName = 'OthersActivityStatus';

export default OthersActivityStatus;
