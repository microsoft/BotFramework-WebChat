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

import useStyleSet from '../hooks/useStyleSet';
import dereferenceBlankNodes from '../Utils/JSONLinkedData/dereferenceBlankNodes';
import Originator from './private/Originator';
import Timestamp from './Timestamp';
import ActivityFeedback from '../Activity/ActivityFeedback';
import StatusSlot from './StatusSlot';

type Props = Readonly<{ activity: WebChatActivity }>;

const warnRootLevelThings = warnOnce(
  'Root-level things are being deprecated, please relate all things to `entities[@id=""]` instead. This feature will be removed in 2025-03-06.'
);

const OthersActivityStatus = memo(({ activity }: Props) => {
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
    <div className={classNames('webchat__activity-status', 'webchat__activity-status--slotted', sendStatus + '')}>
      <StatusSlot>{timestamp && <Timestamp key="timestamp" timestamp={timestamp} />}</StatusSlot>
      <StatusSlot>{claimInterpreter && <Originator key="originator" project={claimInterpreter} />}</StatusSlot>
      <StatusSlot>
        <ActivityFeedback activity={activity} key="feedback" placement="activity-status" />
      </StatusSlot>
    </div>
  );
});

OthersActivityStatus.displayName = 'OthersActivityStatus';

export default OthersActivityStatus;
