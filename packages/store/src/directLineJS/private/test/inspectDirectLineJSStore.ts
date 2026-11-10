import { literal, looseObject, parse, string, tuple, unknown } from 'valibot';
import type { Node } from '../../../node/Node.ts';
import createDirectLineJSStore from '../../createDirectLineJSStore.ts';
import type DirectLineJSStore from '../../DirectLineJSStore.ts';
import { getActivityIdentifier } from '../activityIdentifier.ts';
import createMockDirectLine from './createMockDirectLine.ts';

type SortedEntry = {
  readonly activityId: string;
  readonly dateCreated: string | undefined;
};

const rawJSONSchema = tuple([looseObject({ '@type': literal('@json'), '@value': unknown() })]);

const rawJSONActivitySchema = tuple([
  looseObject({ '@type': literal('@json'), '@value': looseObject({ id: string() }) })
]);

/**
 * Creates a `DirectLineJSStore` connected to a mock Direct Line, then emits the initial activities in order.
 *
 * Call `emitActivity()` to emit more incoming activities.
 */
function createTestStore(initialActivities: readonly unknown[] = []): {
  readonly emitActivity: (activity: unknown) => void;
  readonly store: DirectLineJSStore;
} {
  const { directLine, emitActivity } = createMockDirectLine();
  const store = createDirectLineJSStore({ directLine });

  for (const activity of initialActivities) {
    emitActivity(activity);
  }

  return Object.freeze({ emitActivity, store });
}

/**
 * Emits a `messageDelete` activity to delete the activity.
 */
function deleteActivity(emitActivity: (activity: unknown) => void, activityId: string | undefined): void {
  if (!activityId) {
    throw new Error('Activity ID to delete must be set');
  }

  emitActivity({ from: { id: 'bot', role: 'bot' }, id: activityId, type: 'messageDelete' });
}

function getActivityNode(store: DirectLineJSStore, activityId: string): Node | undefined {
  return store.queryByIdentifier(getActivityIdentifier(activityId));
}

/**
 * Gets number of activity nodes in the graph, including those which are not part of the conversation.
 */
function getNumActivityNode(store: DirectLineJSStore): number {
  return Array.from(store.getSnapshot().values()).filter(node =>
    node['@type'].has('urn:microsoft:webchat:direct-line-activity')
  ).length;
}

/**
 * Gets the original activity of the node, as received from Direct Line.
 */
function getRawActivity(node: Node | undefined): unknown {
  return parse(rawJSONSchema, node?.['urn:microsoft:webchat:direct-line-activity:raw-json'])[0]['@value'];
}

/**
 * Gets activity ID and `dateCreated` of activities which are part of the conversation, sorted by `dateCreated`.
 */
function getSortedEntries(store: DirectLineJSStore): readonly SortedEntry[] {
  return Object.freeze(
    Array.from(store.getSortedParts(store.conversationId, { by: 'dateCreated' }), node =>
      Object.freeze({
        activityId: parse(rawJSONActivitySchema, node['urn:microsoft:webchat:direct-line-activity:raw-json'])[0][
          '@value'
        ].id,
        dateCreated: node.dateCreated
      })
    )
  );
}

/**
 * Gets IDs of activities which are part of the conversation, sorted by `dateCreated`.
 */
function getSortedActivityIds(store: DirectLineJSStore): readonly string[] {
  return Object.freeze(getSortedEntries(store).map(({ activityId }) => activityId));
}

/**
 * Checks if the node of the activity is part of the conversation.
 */
function isPartOfConversation(store: DirectLineJSStore, activityId: string): boolean {
  const node = getActivityNode(store, activityId);

  return !!node?.isPartOf && Array.from(node.isPartOf).some(({ '@id': id }) => id === store.conversationId);
}

function toISOString(time: number): string {
  return new Date(time).toISOString();
}

export {
  createTestStore,
  deleteActivity,
  getActivityNode,
  getNumActivityNode,
  getRawActivity,
  getSortedActivityIds,
  getSortedEntries,
  isPartOfConversation,
  toISOString,
  type SortedEntry
};
