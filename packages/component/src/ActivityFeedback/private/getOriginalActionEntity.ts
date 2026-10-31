import { type WebChatActivity } from 'botframework-webchat-core';
import { isOfType, jsonLinkedDataSchema } from 'botframework-webchat-core/json-ld.js';
import { type OrgSchemaAction } from 'botframework-webchat-core/org-schema.js';
import {
  fallback,
  is,
  literal,
  looseObject,
  parse,
  picklist,
  pipe,
  startsWith,
  string,
  type InferInput
} from 'valibot';

const selfMessageEntitySchema = looseObject({
  '@id': literal(''),
  type: pipe(string(), startsWith('https://schema.org/'))
});

const isSelfMessageEntity: (entity: unknown) => entity is InferInput<typeof selfMessageEntitySchema> = is.bind(
  undefined,
  selfMessageEntitySchema
);

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
  const isLikeAction = isOfType('LikeAction', action);
  const isDislikeAction = !isLikeAction && isOfType('DislikeAction', action);

  if (isLikeAction || isDislikeAction) {
    // We cannot use getOrgSchemaMessage() because it is not using looseObject().
    // Message thing must be a root-level object in graph.
    const messageEntity = activity.entities?.find(isSelfMessageEntity);
    const targetActionType = isDislikeAction ? 'DislikeAction' : 'LikeAction';

    const reactionActionEntity = [messageEntity?.potentialAction]
      .flat()
      .find(
        (entity): entity is { readonly [key: string]: unknown } =>
          entity && is(jsonLinkedDataSchema, entity) && [entity['@type']].flat().includes(targetActionType)
      );

    if (reactionActionEntity) {
      return reactionActionEntity;
    }

    // While we receive `LikeAction`/`DislikeAction`, we found not equivalent in the activity.
    // Fallback to `VoteAction[actionOption="upvote/downvote"]` instead.
  }

  let legacyActionOption: 'downvote' | 'upvote' | undefined;

  if (isLikeAction) {
    // Convert modern `LikeAction` into legacy `VoteAction[actionOption="upvote"]`.
    legacyActionOption = 'upvote';
  } else if (isDislikeAction) {
    // Convert modern `DislikeAction` into legacy `VoteAction[actionOption="downvote"]`.
    legacyActionOption = 'downvote';
  } else if (isOfType('VoteAction', action)) {
    // We only support `actionOption satisfies 'upvote' | 'downvote'` and don't support `Thing`.
    legacyActionOption = parse(fallback(picklist(['downvote', 'upvote']), undefined), action.actionOption[0]);
  }

  if (legacyActionOption) {
    const isTargetVoteAction = is.bind(
      undefined,
      looseObject({
        actionOption: literal(legacyActionOption),
        type: literal('https://schema.org/VoteAction')
      })
    );

    return activity.entities?.find(isTargetVoteAction);
  }

  // Either received UnknownAction or VoteAction.actionOption is not "upvote"/"downvote".
  return undefined;
}
