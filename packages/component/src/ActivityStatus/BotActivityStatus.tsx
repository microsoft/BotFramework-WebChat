import React, { memo, type ReactNode, useMemo } from 'react';

import { type WebChatActivity } from 'botframework-webchat-core';

import { isReplyAction, type ReplyAction } from '../types/external/SchemaOrg/ReplyAction';
import { isThing, type Thing } from '../types/external/SchemaOrg/Thing';

import Feedback from './private/Feedback/Feedback';
import Originator from './private/Originator';
import Slotted from './private/Slotted';
import Timestamp from './Timestamp';

import { type TypeOfArray } from '../types/internal/TypeOfArray';
import { isVoteAction, type VoteAction } from '../types/external/SchemaOrg/VoteAction';

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
  const entities = activity.entities as Array<Thing | WebChatEntity>;

  const replyAction = entities.find<ReplyAction>(
    (entity): entity is ReplyAction => isThing(entity) && isReplyAction(entity)
  );

  const { timestamp } = activity;

  const votes = useMemo(
    () =>
      Object.freeze(
        new Set(
          (entities || [])
            .filter<DownvoteAction | UpvoteAction>(
              (entity): entity is DownvoteAction | UpvoteAction =>
                isThing(entity) && isVoteAction(entity) && (isDownvoteAction(entity) || isUpvoteAction(entity))
            )
            .map(({ actionOption }) => actionOption)
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
            votes.size && <Feedback key="feedback" votes={votes} />
          ].filter(Boolean),
        [replyAction, timestamp, votes]
      )}
    </Slotted>
  );
});

ActivityStatus.displayName = 'ActivityStatus';

export default ActivityStatus;
