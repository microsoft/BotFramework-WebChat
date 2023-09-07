import React, { memo, type ReactNode, useMemo } from 'react';

import { type WebChatActivity } from 'botframework-webchat-core';

import { isReplyAction, type ReplyAction } from '../types/external/SchemaOrg/ReplyAction';
import { isThing, type Thing } from '../types/external/SchemaOrg/Thing';
import { isVoteAction, type VoteAction } from '../types/external/SchemaOrg/VoteAction';
import { type TypeOfArray } from '../types/internal/TypeOfArray';
import Feedback from './private/Feedback/Feedback';
import Originator from './private/Originator';
import Slotted from './private/Slotted';
import Timestamp from './Timestamp';

type WebChatEntity = TypeOfArray<Exclude<WebChatActivity['entities'], undefined>>;

type DownvoteAction = VoteAction & { actionOption: 'downvote' };
type UpvoteAction = VoteAction & { actionOption: 'upvote' };

function isDownvoteAction(voteAction: VoteAction): voteAction is DownvoteAction {
  return voteAction.actionOption === 'downvote';
}

function isUpvoteAction(voteAction: VoteAction): voteAction is UpvoteAction {
  return voteAction.actionOption === 'upvote';
}

type Props = { activity: WebChatActivity };

const ActivityStatus = memo(({ activity }: Props) => {
  const entities = activity.entities as Array<Thing | WebChatEntity> | undefined;

  const replyAction = entities?.find<ReplyAction>(
    (entity): entity is ReplyAction => isThing(entity) && isReplyAction(entity)
  );

  const { timestamp } = activity;

  const voteActions = useMemo<Set<VoteAction>>(
    () =>
      Object.freeze(
        new Set(
          (entities || []).filter<DownvoteAction | UpvoteAction>(
            (entity): entity is DownvoteAction | UpvoteAction =>
              isThing(entity) && isVoteAction(entity) && (isDownvoteAction(entity) || isUpvoteAction(entity))
          )
        )
      ),
    [entities]
  );

  return (
    <Slotted>
      {useMemo<ReactNode[]>(
        () =>
          [
            timestamp && <Timestamp key="timestamp" timestamp={timestamp} />,
            replyAction && <Originator key="originator" replyAction={replyAction} />,
            voteActions.size && <Feedback key="feedback" voteActions={voteActions} />
          ].filter(Boolean),
        [replyAction, timestamp, voteActions]
      )}
    </Slotted>
  );
});

ActivityStatus.displayName = 'ActivityStatus';

export default ActivityStatus;
