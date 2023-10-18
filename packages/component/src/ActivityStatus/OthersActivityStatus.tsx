import {
  isOrgSchemaThingAsEntity,
  isOrgSchemaThingOf,
  type OrgSchemaAsEntity,
  type OrgSchemaClaim,
  type OrgSchemaVoteAction,
  type WebChatActivity
} from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo, type ReactNode, useMemo } from 'react';

import Feedback from './private/Feedback/Feedback';
import Originator from './private/Originator';
import Slotted from './Slotted';
import Timestamp from './Timestamp';
import useStyleSet from '../hooks/useStyleSet';

type DownvoteAction = OrgSchemaVoteAction & { actionOption: 'downvote' };
type UpvoteAction = OrgSchemaVoteAction & { actionOption: 'upvote' };

function isDownvoteAction(voteAction: OrgSchemaVoteAction): voteAction is DownvoteAction {
  return voteAction.actionOption === 'downvote';
}

function isUpvoteAction(voteAction: OrgSchemaVoteAction): voteAction is UpvoteAction {
  return voteAction.actionOption === 'upvote';
}

type Props = Readonly<{ activity: WebChatActivity }>;

const OthersActivityStatus = memo(({ activity }: Props) => {
  const [{ sendStatus }] = useStyleSet();
  // const entities = activity.entities as Array<OrgSchemaThing | WebChatEntity> | undefined;
  const { entities, timestamp } = activity;

  const firstClaim = useMemo<OrgSchemaClaim>(
    () =>
      (entities || []).find<OrgSchemaAsEntity<OrgSchemaClaim>>(
        (entity): entity is OrgSchemaAsEntity<OrgSchemaClaim> =>
          isOrgSchemaThingAsEntity(entity) && isOrgSchemaThingOf<OrgSchemaClaim>(entity, 'Claim')
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

  return (
    <Slotted className={classNames('webchat__activity-status', sendStatus + '')}>
      {useMemo<ReactNode[]>(
        () =>
          [
            timestamp && <Timestamp key="timestamp" timestamp={timestamp} />,
            firstClaim?.claimInterpreter && (
              <Originator claimInterpreter={firstClaim?.claimInterpreter} key="originator" />
            ),
            voteActions.size && <Feedback key="feedback" voteActions={voteActions} />
          ].filter(Boolean),
        [firstClaim, timestamp, voteActions]
      )}
    </Slotted>
  );
});

OthersActivityStatus.displayName = 'OthersActivityStatus';

export default OthersActivityStatus;
