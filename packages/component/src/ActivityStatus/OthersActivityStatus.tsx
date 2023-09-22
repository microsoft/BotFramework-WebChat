import { type WebChatActivity } from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo, type ReactNode, useMemo } from 'react';

import { isReplyAction, type ReplyAction } from '../types/external/OrgSchema/ReplyAction';
import { isThing, type Thing } from '../types/external/OrgSchema/Thing';
import { isVoteAction, type VoteAction } from '../types/external/OrgSchema/VoteAction';
import { type TypeOfArray } from '../types/internal/TypeOfArray';
import Feedback from './private/Feedback/Feedback';
import Originator from './private/Originator';
import Slotted from './Slotted';
import Timestamp from './Timestamp';
import useStyleSet from '../hooks/useStyleSet';

type WebChatEntity = TypeOfArray<Exclude<WebChatActivity['entities'], undefined>>;

type DownvoteAction = VoteAction & { actionOption: 'downvote' };
type UpvoteAction = VoteAction & { actionOption: 'upvote' };

function isDownvoteAction(voteAction: VoteAction): voteAction is DownvoteAction {
  return voteAction.actionOption === 'downvote';
}

function isUpvoteAction(voteAction: VoteAction): voteAction is UpvoteAction {
  return voteAction.actionOption === 'upvote';
}

type Props = Readonly<{ activity: WebChatActivity }>;

const OthersActivityStatus = memo(({ activity }: Props) => {
  const [{ sendStatus }] = useStyleSet();
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
    <Slotted className={classNames('webchat__activity-status', sendStatus + '')}>
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

OthersActivityStatus.displayName = 'OthersActivityStatus';

export default OthersActivityStatus;
