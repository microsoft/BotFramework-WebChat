import { type WebChatActivity } from 'botframework-webchat-core';
import { isOfType } from 'botframework-webchat-core/json-ld.js';
import { type OrgSchemaAction } from 'botframework-webchat-core/org-schema.js';
import { is, literal, object } from 'valibot';

/**
 * Finds the `VoteAction` entity the bot sent for the action, unparsed, including properties unknown to Schema.org.
 *
 * Bots read their own properties (e.g. prompt ID) back from the feedback activity, as Web Chat 4.18 sent the entity as-is.
 *
 * @param activity Activity as received from the bot, before Web Chat patches its entities
 * @param action Action selected by the user, either a `VoteAction` or a `LikeAction`/`DislikeAction`
 * @returns The `VoteAction` entity with the same `actionOption` ("upvote" for like, "downvote" for dislike), or `undefined`
 */
export default function getVoteActionEntity(
  activity: WebChatActivity,
  action: OrgSchemaAction
): Readonly<{ type: string }> | undefined {
  const [actionOption] = isOfType('VoteAction', action)
    ? action.actionOption
    : [isOfType('DislikeAction', action) ? 'downvote' : 'upvote'];

  return typeof actionOption === 'string'
    ? activity.entities?.find(entity =>
        is(object({ actionOption: literal(actionOption), type: literal('https://schema.org/VoteAction') }), entity)
      )
    : undefined;
}
