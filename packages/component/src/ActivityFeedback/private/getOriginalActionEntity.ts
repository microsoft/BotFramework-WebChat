import { type WebChatActivity } from 'botframework-webchat-core';
import { isOfType, jsonLinkedDataSchema } from 'botframework-webchat-core/json-ld.js';
import { type OrgSchemaAction } from 'botframework-webchat-core/org-schema.js';
import { is, literal, looseObject, pipe, startsWith, string } from 'valibot';

import dereferenceBlankNodes from '../../Utils/JSONLinkedData/dereferenceBlankNodes.js';

const messageEntitySchema = looseObject({
  '@id': literal(''),
  type: pipe(string(), startsWith('https://schema.org/'))
});

/**
 * Finds the action as the bot sent it, unparsed, so custom properties (e.g. prompt ID) are kept, as in Web Chat 4.18:
 * first by `@type` in `potentialAction` of the message entity, then the root-level `VoteAction` by `actionOption`
 * ("upvote" for like, "downvote" for dislike), which also covers the like/dislike added for `channelData.feedbackLoop`.
 *
 * @param activity Activity as received from the bot, before Web Chat patches its entities
 * @param action Action selected by the user
 * @returns The action entity as sent by the bot, or `undefined`
 */
export default function getOriginalActionEntity(
  activity: WebChatActivity,
  action: OrgSchemaAction
): { readonly [key: string]: unknown } | undefined {
  const reactionType = isOfType('LikeAction', action)
    ? 'LikeAction'
    : isOfType('DislikeAction', action)
      ? 'DislikeAction'
      : undefined;

  const messageEntity =
    reactionType && dereferenceBlankNodes(activity.entities || []).find(entity => is(messageEntitySchema, entity));

  const reactionActionEntity = [messageEntity?.potentialAction]
    .flat()
    .find(
      (entity): entity is { readonly [key: string]: unknown } =>
        is(jsonLinkedDataSchema, entity) && [entity['@type']].flat().includes(reactionType)
    );

  const [actionOption] = isOfType('VoteAction', action)
    ? action.actionOption
    : [reactionType === 'DislikeAction' ? 'downvote' : 'upvote'];

  return (
    reactionActionEntity ??
    (typeof actionOption === 'string'
      ? activity.entities?.find(entity =>
          is(
            looseObject({ actionOption: literal(actionOption), type: literal('https://schema.org/VoteAction') }),
            entity
          )
        )
      : undefined)
  );
}
