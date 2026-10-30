import { type WebChatActivity } from 'botframework-webchat-core';
import { isOfType } from 'botframework-webchat-core/json-ld.js';
import { type OrgSchemaAction } from 'botframework-webchat-core/org-schema.js';
import { array, is, literal, looseObject, pipe, startsWith, string, union, unknown } from 'valibot';

import dereferenceBlankNodes from '../../Utils/JSONLinkedData/dereferenceBlankNodes.js';

const actionEntitySchema = looseObject({ '@type': union([string(), array(string())]) });

const messageEntitySchema = looseObject({
  '@id': literal(''),
  potentialAction: unknown(),
  type: pipe(string(), startsWith('https://schema.org/'))
});

/**
 * Finds the action as the bot sent it, unparsed, including properties unknown to Schema.org (e.g. prompt ID).
 *
 * Bots read their own properties back from the feedback activity, as Web Chat 4.18 sent the action as-is:
 *
 * 1. `LikeAction`/`DislikeAction`: the action of the same type in `potentialAction` of the message entity (`@id` is "")
 * 2. Otherwise, or if not found: the root-level `VoteAction` with the same `actionOption` ("upvote" for like, "downvote" for dislike),
 *    this covers `VoteAction` and the like/dislike actions Web Chat adds for `channelData.feedbackLoop`
 *
 * @param activity Activity as received from the bot, before Web Chat patches its entities
 * @param action Action selected by the user
 * @returns The action entity as sent by the bot, or `undefined`
 */
export default function getOriginalActionEntity(
  activity: WebChatActivity,
  action: OrgSchemaAction
): { readonly [key: string]: unknown } | undefined {
  const graph: readonly unknown[] = dereferenceBlankNodes(activity.entities || []);
  const reactionType = isOfType('LikeAction', action)
    ? 'LikeAction'
    : isOfType('DislikeAction', action)
      ? 'DislikeAction'
      : undefined;

  if (reactionType) {
    const messageEntity = graph.find(entity => is(messageEntitySchema, entity));
    const potentialActions: readonly unknown[] = is(messageEntitySchema, messageEntity)
      ? [messageEntity.potentialAction].flat()
      : [];

    const reactionActionEntity = potentialActions.find(
      entity => is(actionEntitySchema, entity) && [entity['@type']].flat().includes(reactionType)
    );

    if (is(actionEntitySchema, reactionActionEntity)) {
      return reactionActionEntity;
    }
  }

  const [actionOption] = isOfType('VoteAction', action)
    ? action.actionOption
    : [reactionType === 'DislikeAction' ? 'downvote' : 'upvote'];

  return typeof actionOption === 'string'
    ? activity.entities?.find(entity =>
        is(looseObject({ actionOption: literal(actionOption), type: literal('https://schema.org/VoteAction') }), entity)
      )
    : undefined;
}
