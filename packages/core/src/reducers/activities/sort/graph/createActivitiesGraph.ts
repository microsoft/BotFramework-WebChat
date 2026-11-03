import { Store } from 'botframework-webchat-store';
import { withProperties } from './private/nodeProperties';
import type { GraphNode, GraphTransaction } from './types';

/** The conversation node every activity is part of (directly or through a grouping). */
const CONVERSATION_ID = '_:webchat:conversation';

type ActivitiesGraph = {
  /** Runs a transaction on the store: all of its writes are committed, or none if it throws. */
  readonly edit: (transactor: (transaction: GraphTransaction) => void) => void;
  readonly store: Store;
  /** Number of committed transactions that wrote. A `State` is current only if it was derived at this version. */
  readonly version: number;
};

/**
 * Creates William's store with core as its source: core's reducer edits the graph when it receives an activity.
 *
 * `createDirectLineStore()` is not used: today it is a stub that adds a sample node.
 *
 * @param nodes Nodes to start with, e.g. to rebuild the graph of an older `State` (replay).
 */
export default function createActivitiesGraph(nodes: Iterable<GraphNode> = []): ActivitiesGraph {
  let controllerEdit: ActivitiesGraph['edit'] | undefined;
  let version = 0;

  const store = new Store({
    start(controller) {
      controllerEdit = transactor => controller.edit(transactor);
    }
  });

  if (!controllerEdit) {
    throw new Error('botframework-webchat: The store did not start its source synchronously');
  }

  const edit = controllerEdit;
  const initialNodes = Array.from(nodes);

  // The store notifies after every commit with changes. A transaction that throws is not committed.
  store.subscribe(() => {
    version++;
  });

  initialNodes.length &&
    edit(transaction => {
      for (const node of initialNodes) {
        // `isPartOf` is core's source of truth: a journal node can hold a `hasPart` from before a part left.
        transaction.upsert(node['@id'], () => withProperties(node, { hasPart: undefined }));
      }

      transaction.autoFixRelationship();
    });

  return Object.freeze({
    edit,
    store,
    get version() {
      return version;
    }
  });
}

export { CONVERSATION_ID, type ActivitiesGraph };
