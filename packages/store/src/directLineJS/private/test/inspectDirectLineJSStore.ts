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
 * Creates a `DirectLineJSStore` connected to a mock Direct Line, call `emitActivity()` to emit an incoming activity.
 */
function createTestStore(): { readonly emitActivity: (activity: unknown) => void; readonly store: DirectLineJSStore } {
  const { directLine, emitActivity } = createMockDirectLine();

  return Object.freeze({ emitActivity, store: createDirectLineJSStore({ directLine }) });
}

function deleteActivity(emitActivity: (activity: unknown) => void, activityId: string): void {
  emitActivity({ from: { id: 'bot', role: 'bot' }, id: activityId, type: 'messageDelete' });
}

function getActivityNode(store: DirectLineJSStore, activityId: string): Node | undefined {
  return store.queryByIdentifier(getActivityIdentifier(activityId));
}

/**
 * Gets the original activity of the node, as received from Direct Line.
 */
function getRawActivity(node: Node | undefined): unknown {
  return parse(rawJSONSchema, node?.['urn:microsoft:webchat:direct-line-activity:raw-json'])[0]['@value'];
}

/**
 * Gets IDs of activities which are part of the conversation, sorted by `dateCreated`.
 */
function getSortedActivityIds(store: DirectLineJSStore): readonly string[] {
  return Object.freeze(getSortedEntries(store).map(({ activityId }) => activityId));
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
  getRawActivity,
  getSortedActivityIds,
  getSortedEntries,
  isPartOfConversation,
  toISOString,
  type SortedEntry
};
