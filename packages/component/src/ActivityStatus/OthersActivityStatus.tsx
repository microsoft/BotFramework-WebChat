import {
  getOrgSchemaMessage,
  OrgSchemaAction2,
  OrgSchemaProject2,
  parseAction,
  parseClaim,
  warnOnce,
  type WebChatActivity
} from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo, useMemo, type ReactNode } from 'react';

import useStyleSet from '../hooks/useStyleSet';
import Feedback from './private/Feedback/Feedback';
import Originator from './private/Originator';
import Slotted from './Slotted';
import Timestamp from './Timestamp';

type Props = Readonly<{ activity: WebChatActivity }>;

const warnRootLevelThings = warnOnce(
  'Root-level things are being deprecated, please relate all things to `entities[@id=""]` instead. This feature will be removed in 2025-03-06.'
);

const OthersActivityStatus = memo(({ activity }: Props) => {
  const [{ sendStatus }] = useStyleSet();
  const { timestamp } = activity;
  const entities = useMemo(() => activity.entities || [], [activity]);
  const messageThing = useMemo(() => getOrgSchemaMessage(activity), [activity]);

  const claimInterpreter = useMemo<OrgSchemaProject2 | undefined>(() => {
    try {
      if (messageThing) {
        return parseClaim((messageThing?.citation || [])[0])?.claimInterpreter;
      }

      const [firstClaim] = entities.filter(({ type }) => type === 'https://schema.org/Claim').map(parseClaim);

      if (firstClaim) {
        warnRootLevelThings();

        return firstClaim?.claimInterpreter;
      }

      const replyAction = parseAction(entities.find(({ type }) => type === 'https://schema.org/ReplyAction'));

      if (replyAction) {
        warnRootLevelThings();

        return replyAction?.provider;
      }
    } catch {
      // Intentionally left blank.
    }
  }, [entities, messageThing]);

  const feedbackActions = useMemo<ReadonlySet<OrgSchemaAction2> | undefined>(() => {
    try {
      const reactActions = (messageThing?.potentialAction || []).filter(
        ({ '@type': type }) => type === 'LikeAction' || type === 'DislikeAction'
      );

      if (reactActions.length) {
        return Object.freeze(new Set(reactActions));
      }

      const voteActions = entities.filter(({ type }) => type === 'https://schema.org/VoteAction').map(parseAction);

      if (voteActions.length) {
        return Object.freeze(new Set(voteActions));
      }
    } catch {
      // Intentionally left blank.
    }
  }, [entities, messageThing]);

  return (
    <Slotted className={classNames('webchat__activity-status', sendStatus + '')}>
      {useMemo<ReactNode[]>(
        () =>
          [
            timestamp && <Timestamp key="timestamp" timestamp={timestamp} />,
            claimInterpreter && <Originator key="originator" project={claimInterpreter} />,
            feedbackActions?.size && <Feedback actions={feedbackActions} key="feedback" />
          ].filter(Boolean),
        [claimInterpreter, timestamp, feedbackActions]
      )}
    </Slotted>
  );
});

OthersActivityStatus.displayName = 'OthersActivityStatus';

export default OthersActivityStatus;
