import { v4 } from 'uuid';
import { custom, function_, is, looseObject, object, optional, parse, pipe, readonly, string, type InferInput } from 'valibot';
import type { Identifier } from '../node/NodeIdentifier.ts';
import Store, { type StoreController } from '../Store.ts';
import { getActivityIdentifier, getClientActivityIdentifier } from './private/activityIdentifier.ts';
import activityToNode, { type CreativeWorkStatus } from './private/activityToNode.ts';
import { AUDIENCE_TYPES, getAudienceId } from './private/audience.ts';
import computeDateCreated from './private/computeDateCreated.ts';
import { parseDirectLineActivity, type DirectLineActivity } from './private/DirectLineActivity.ts';
import {
  deleteSortedActivity,
  getSortedActivities,
  INITIAL_SORT_STATE,
  toSortableActivity,
  upsertSortedActivity,
  type SortState
} from './private/sortState.ts';

// We will hold up the replying activity if the originating activity did not arrive, up to 5 seconds.
const REPLY_TIMEOUT = 5_000;

// Activities received from Direct Line are always from the server.
const INCOMING_CREATIVE_WORK_STATUS: CreativeWorkStatus = 'Published';

type DirectLineJSBotConnection = {
  readonly activity$: {
    subscribe(observer: {
      readonly error?: ((error: unknown) => void) | undefined;
      readonly next: (activity: unknown) => void;
    }): unknown;
  };
};

type DirectLineJSStorePonyfill = {
  readonly clearTimeout: (handle: ReturnType<typeof setTimeout>) => void;
  readonly setTimeout: (handler: () => void, timeout: number) => ReturnType<typeof setTimeout>;
};

// `custom()` is used to keep the original object, so methods are called with the original `this`.
const directLineJSStoreInitSchema = pipe(
  object({
    directLine: custom<DirectLineJSBotConnection>(
      value => is(looseObject({ activity$: looseObject({ subscribe: function_() }) }), value),
      '"directLine" must be a DirectLineJS bot connection with "activity$" observable'
    ),
    ponyfill: optional(
      custom<DirectLineJSStorePonyfill>(
        value => is(looseObject({ clearTimeout: function_(), setTimeout: function_() }), value),
        '"ponyfill" must have "clearTimeout" and "setTimeout" functions'
      )
    ),
    userId: optional(string('"userId" must be a string'))
  }),
  readonly()
);

type DirectLineJSStoreInit = InferInput<typeof directLineJSStoreInitSchema>;

type PendingActivity = {
  readonly activity: DirectLineActivity;
  readonly replyToId: string;
  readonly timeout: ReturnType<typeof setTimeout>;
};

function incrementCount<T>(map: Map<T, number>, key: T, delta: number): void {
  const count = (map.get(key) ?? 0) + delta;

  count ? map.set(key, count) : map.delete(key);
}

/**
 * A store which receives activities from a DirectLineJS bot connection and converts them into nodes.
 *
 * - On start, a `Conversation` node is created as the root node, see `conversationId`
 * - Incoming activities are converted into `Message` nodes, which are part of the `Conversation` node
 * - Activities are sorted, the sort result is placed in `dateCreated`, use `getSortedParts(conversationId)` to get them
 *   in order
 * - Activity replying to another activity which has not arrived yet are held up to 5 seconds
 * - Activity with same ID is an update, `messageUpdate` activity also updates, `messageDelete` activity deletes
 *
 * `@id` of nodes are random blank node identifiers, server activity ID and client activity ID are put in `identifier`,
 * use `queryByIdentifier(getActivityIdentifier(activityId))` to find the node of an activity.
 */
class DirectLineJSStore extends Store {
  constructor(init: DirectLineJSStoreInit) {
    const { directLine, ponyfill = globalThis, userId } = parse(directLineJSStoreInitSchema, init);

    let controller: StoreController | undefined;

    super({
      start(nextController) {
        controller = nextController;
      }
    });

    if (!controller) {
      throw new Error('Controller should be set after start');
    }

    this.#controller = controller;
    this.#ponyfill = ponyfill;
    this.#userId = userId;

    const conversationId = this.#conversationId;

    controller.edit(transaction => {
      transaction.upsert(conversationId, () => ({
        '@id': conversationId,
        '@type': new Set(['Conversation'])
      }));

      for (const audienceType of AUDIENCE_TYPES) {
        const audienceId = getAudienceId(audienceType);

        transaction.upsert(audienceId, () => ({
          '@id': audienceId,
          '@type': new Set(['Audience']),
          audienceType: [audienceType]
        }));
      }
    });

    directLine.activity$.subscribe(
      Object.freeze({
        error: (error: unknown) => console.error('botframework-webchat: Error from "activity$" observable.', { error }),
        next: (activity: unknown) => this.#handleActivity(activity)
      })
    );
  }

  /** Key is `@id` of the node, value is the activity. */
  #activities: ReadonlyMap<Identifier, DirectLineActivity> = new Map();
  #controller: StoreController;
  #conversationId: Identifier = `_:${v4()}`;
  /** Key is `@id` of the node, value is `dateCreated` of the node, or not set if not part of the conversation. */
  #dateCreatedMap: ReadonlyMap<Identifier, string> = new Map();
  #numBotActivity = 0;
  /** Activities which are replying to an activity not arrived yet, in arrival order. */
  #pendingActivities = new Set<PendingActivity>();
  #ponyfill: DirectLineJSStorePonyfill;
  /** Key is `replyToId` of activities in the store, value is number of activities with the same `replyToId`. */
  #replyToIdCounts = new Map<string, number>();
  #sortState: SortState = INITIAL_SORT_STATE;
  #userId: string | undefined;

  /**
   * `@id` of the root `Conversation` node, all activities are part of it.
   */
  get conversationId(): Identifier {
    return this.#conversationId;
  }

  /**
   * Commits sort state and activity changes to the store. Nodes of changed activities, and nodes which `dateCreated` is
   * changed because of the sort, are upserted.
   *
   * @param activityChanges Key is `@id` of the node, value is the new activity, or `undefined` to delete.
   */
  #apply(nextSortState: SortState, activityChanges: ReadonlyMap<Identifier, DirectLineActivity | undefined>): void {
    const conversationId = this.#conversationId;
    const nextActivities = new Map(this.#activities);
    const nextDateCreatedMap = computeDateCreated(getSortedActivities(nextSortState));
    const nextReplyToIdCounts = new Map(this.#replyToIdCounts);
    const prevDateCreatedMap = this.#dateCreatedMap;

    let nextNumBotActivity = this.#numBotActivity;

    for (const [id, activity] of activityChanges) {
      const prevActivity = nextActivities.get(id);

      if (prevActivity) {
        prevActivity.from.role === 'bot' && nextNumBotActivity--;
        prevActivity.replyToId && incrementCount(nextReplyToIdCounts, prevActivity.replyToId, -1);
      }

      if (activity) {
        activity.from.role === 'bot' && nextNumBotActivity++;
        activity.replyToId && incrementCount(nextReplyToIdCounts, activity.replyToId, 1);
        nextActivities.set(id, activity);
      } else {
        nextActivities.delete(id);
      }
    }

    this.#controller.edit(transaction => {
      for (const [id, activity] of nextActivities) {
        const dateCreated = nextDateCreatedMap.get(id);

        (activityChanges.has(id) || prevDateCreatedMap.get(id) !== dateCreated) &&
          transaction.upsert(id, () =>
            activityToNode(activity, {
              conversationId,
              creativeWorkStatus: INCOMING_CREATIVE_WORK_STATUS,
              dateCreated,
              id
            })
          );
      }

      for (const [id, activity] of activityChanges) {
        activity || transaction.delete(id);
      }
    });

    // Only update after the edit is committed successfully.
    this.#activities = nextActivities;
    this.#dateCreatedMap = nextDateCreatedMap;
    this.#numBotActivity = nextNumBotActivity;
    this.#replyToIdCounts = nextReplyToIdCounts;
    this.#sortState = nextSortState;
  }

  /**
   * Commits the activity, then releases pending activities which are replying to it. Failed activities are skipped.
   */
  #commitActivity(activity: DirectLineActivity): void {
    const queue = [activity];

    for (let nextActivity = queue.shift(); nextActivity; nextActivity = queue.shift()) {
      try {
        this.#upsertActivity(nextActivity);
      } catch (error) {
        console.error('botframework-webchat: Failed to process incoming activity.', { activity: nextActivity, error });
      }

      // Also release pending activities with the same `replyToId`, as we already waited long enough for the missing
      // activity to show up.
      for (const pendingActivity of this.#pendingActivities) {
        if (
          pendingActivity.replyToId === nextActivity.id ||
          pendingActivity.replyToId === nextActivity.replyToId
        ) {
          this.#pendingActivities.delete(pendingActivity);
          this.#ponyfill.clearTimeout(pendingActivity.timeout);
          queue.push(pendingActivity.activity);
        }
      }
    }
  }

  #deleteActivity(activityId: string): void {
    // Activity being held is not in the store yet.
    for (const pendingActivity of this.#pendingActivities) {
      if (pendingActivity.activity.id === activityId) {
        this.#pendingActivities.delete(pendingActivity);
        this.#ponyfill.clearTimeout(pendingActivity.timeout);
      }
    }

    const node = this.queryByIdentifier(getActivityIdentifier(activityId));

    node && this.#apply(deleteSortedActivity(this.#sortState, node['@id']), new Map([[node['@id'], undefined]]));
  }

  #handleActivity(value: unknown): void {
    try {
      let activity = parseDirectLineActivity(value, this.#userId);

      if (activity.type === 'messageDelete') {
        activity.id && this.#deleteActivity(activity.id);

        return;
      }

      activity.type === 'messageUpdate' && (activity = Object.freeze({ ...activity, type: 'message' }));

      if (activity.from.role !== 'user' && !activity.id) {
        const id = v4();

        console.warn('botframework-webchat: Incoming activity must have "id" field set, assigning a random value as ID', {
          activity,
          newActivityId: id
        });

        activity = Object.freeze({ ...activity, id });
      }

      const { replyToId } = activity;

      // To speed up the first activity render time, we do not delay the first activity from the bot.
      // Even if it is the first activity from the bot, the bot might be "replying" to the "conversationUpdate" event.
      // Thus, the "replyToId" will always be there even it is the first activity in the conversation.
      if (
        replyToId &&
        this.#numBotActivity &&
        !this.queryByIdentifier(getActivityIdentifier(replyToId)) &&
        !this.#replyToIdCounts.has(replyToId)
      ) {
        // Either the activity replied to is in the store or after timeout.
        const timeout = this.#ponyfill.setTimeout(() => {
          if (this.#pendingActivities.delete(pendingActivity)) {
            console.warn(
              `botframework-webchat: Timed out while waiting for activity "${replyToId}" which activity "${activity.id}" is replying to.`,
              { activity, replyToId }
            );

            this.#commitActivity(activity);
          }
        }, REPLY_TIMEOUT);

        const pendingActivity: PendingActivity = Object.freeze({ activity, replyToId, timeout });

        this.#pendingActivities.add(pendingActivity);
      } else {
        this.#commitActivity(activity);
      }
    } catch (error) {
      console.error('botframework-webchat: Failed to process incoming activity.', { activity: value, error });
    }
  }

  #upsertActivity(activity: DirectLineActivity): void {
    const {
      from: { role },
      id: activityId
    } = activity;

    // Echo back of outgoing activity is matched by client activity ID.
    const clientActivityId = role === 'user' ? activity.channelData?.clientActivityID : undefined;
    const existingNode =
      (clientActivityId && this.queryByIdentifier(getClientActivityIdentifier(clientActivityId))) ||
      (activityId && this.queryByIdentifier(getActivityIdentifier(activityId))) ||
      undefined;

    const id: Identifier = existingNode?.['@id'] ?? `_:${v4()}`;
    const nextSortState = upsertSortedActivity(this.#sortState, id, toSortableActivity(activity));

    // The activity is ignored, e.g. a revision of a concluded livestream session.
    nextSortState === this.#sortState || this.#apply(nextSortState, new Map([[id, activity]]));
  }
}

export default DirectLineJSStore;
export { type DirectLineJSBotConnection, type DirectLineJSStoreInit, type DirectLineJSStorePonyfill };
