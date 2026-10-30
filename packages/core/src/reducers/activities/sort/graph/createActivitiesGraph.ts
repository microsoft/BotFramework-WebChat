import { Store } from 'botframework-webchat-store';
import type { GraphNode, GraphTransaction } from './types';

/** The conversation node every activity is part of (directly or through a grouping). */
const CONVERSATION_ID = '_:webchat:conversation';

type ActivitiesGraph = {
  /** Runs a transaction on the store. Bumps `version` if the transactor wrote, or threw. */
  readonly edit: (transactor: (transaction: GraphTransaction) => void) => void;
  readonly store: Store;
  /** Number of transactions that wrote or threw. A `State` is current only if it was derived at this version. */
  readonly version: number;
};

/**
 * Creates William's store with core as its source: core's reducer edits the graph when it receives an activity.
 *
 * `createDirectLineStore()` is not used: today it is a stub that adds a sample node.
 *
 * @param nodes Nodes to start with, e.g. to rebuild the graph of an older `State` (replay, or after a failed edit).
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

  initialNodes.length &&
    edit(transaction => {
      for (const node of initialNodes) {
        transaction.upsertNode(node);
      }
    });

  return Object.freeze({
    edit: (transactor: (transaction: GraphTransaction) => void) => {
      let changed = false;
      let succeeded = false;

      try {
        edit(transaction => {
          transactor({
            getNode: id => transaction.getNode(id),
            upsertNode: node => {
              changed = true;
              transaction.upsertNode(node);
            }
          });
        });

        succeeded = true;
      } finally {
        // QUESTION(William): the store has no rollback, a throwing transactor leaves its writes. Bumping the version
        //                    makes the last good `State` stale, so the next action rebuilds the graph from it.
        (changed || !succeeded) && version++;
      }
    },
    store,
    get version() {
      return version;
    }
  });
}

export { CONVERSATION_ID, type ActivitiesGraph };
