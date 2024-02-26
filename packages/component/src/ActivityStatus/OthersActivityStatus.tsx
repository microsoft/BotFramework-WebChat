import {
  isOrgSchemaThingAsEntity,
  isOrgSchemaThingOf,
  warnOnce,
  type OrgSchemaAsEntity,
  type OrgSchemaClaim,
  type OrgSchemaReplyAction,
  type OrgSchemaVoteAction,
  type WebChatActivity
} from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo, useMemo, type ReactNode } from 'react';

import useStyleSet from '../hooks/useStyleSet';
import Feedback from './private/Feedback/Feedback';
import Originator from './private/Originator';
import Slotted from './Slotted';
import Timestamp from './Timestamp';

type DownvoteAction = OrgSchemaVoteAction & { actionOption: 'downvote' };
type UpvoteAction = OrgSchemaVoteAction & { actionOption: 'upvote' };

function isDownvoteAction(voteAction: OrgSchemaVoteAction): voteAction is DownvoteAction {
  return voteAction.actionOption === 'downvote';
}

function isUpvoteAction(voteAction: OrgSchemaVoteAction): voteAction is UpvoteAction {
  return voteAction.actionOption === 'upvote';
}

type Props = Readonly<{ activity: WebChatActivity }>;

const warnDeprecatedReplyAction = warnOnce(
  '"ReplyAction" for originator is being deprecated, please use "claimInterpreter" instead. This feature will be removed in 2025-02-26.'
);

const OthersActivityStatus = memo(({ activity }: Props) => {
  const [{ sendStatus }] = useStyleSet();
  const { entities, timestamp } = activity;

  const firstClaim = useMemo<OrgSchemaClaim>(
    () =>
      (entities || []).find<OrgSchemaAsEntity<OrgSchemaClaim>>(
        (entity): entity is OrgSchemaAsEntity<OrgSchemaClaim> =>
          isOrgSchemaThingAsEntity(entity) && isOrgSchemaThingOf<OrgSchemaClaim>(entity, 'Claim')
      ),
    [entities]
  );

  const replyAction = useMemo<OrgSchemaReplyAction>(
    () =>
      (entities || []).find<OrgSchemaAsEntity<OrgSchemaReplyAction>>(
        (entity): entity is OrgSchemaAsEntity<OrgSchemaReplyAction> =>
          isOrgSchemaThingAsEntity(entity) && isOrgSchemaThingOf<OrgSchemaReplyAction>(entity, 'ReplyAction')
      ),
    [entities]
  );

  const voteActions = useMemo<ReadonlySet<OrgSchemaVoteAction>>(
    () =>
      Object.freeze(
        new Set<OrgSchemaVoteAction>(
          (entities || []).filter<OrgSchemaAsEntity<OrgSchemaVoteAction>>(
            (entity): entity is OrgSchemaAsEntity<OrgSchemaVoteAction> =>
              isOrgSchemaThingAsEntity(entity) &&
              isOrgSchemaThingOf<OrgSchemaVoteAction>(entity, 'VoteAction') &&
              (isDownvoteAction(entity) || isUpvoteAction(entity))
          )
        )
      ),
    [entities]
  );

  replyAction && warnDeprecatedReplyAction();

  return (
    <Slotted className={classNames('webchat__activity-status', sendStatus + '')}>
      {useMemo<ReactNode[]>(
        () =>
          [
            timestamp && <Timestamp key="timestamp" timestamp={timestamp} />,
            firstClaim?.claimInterpreter ? (
              <Originator key="originator" project={firstClaim.claimInterpreter} />
            ) : (
              replyAction?.provider && <Originator key="originator" project={replyAction.provider} />
            ),
            voteActions.size && <Feedback key="feedback" voteActions={voteActions} />
          ].filter(Boolean),
        [firstClaim, replyAction, timestamp, voteActions]
      )}
    </Slotted>
  );
});

OthersActivityStatus.displayName = 'OthersActivityStatus';

export default OthersActivityStatus;
