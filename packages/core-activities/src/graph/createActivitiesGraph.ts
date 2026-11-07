import { Store } from 'botframework-webchat-store';
import { withProperties } from './private/nodeProperties';
import sortParentsFirst from './private/sortParentsFirst';
import type { GraphNode, GraphTransaction } from './types';

/** The conversation node every activity is part of (directly or through a grouping). */
const CONVERSATION_ID = '_:webchat:conversation';

type ActivitiesGraph = {
  /** Runs a transaction on the store: all of its writes are committed, or none if it throws. */
  readonly edit: (transactor: (transaction: GraphTransaction) => void) => void;
  readonly store: Store;
};

/**
 * Creates William's store with core as its source: core's reducer edits the graph when it receives an activity.
 *
 * `createDirectLineStore()` is not used: today it is a stub that adds a sample node.
 *
 * @param nodes Nodes to start with, e.g. the snapshot of an older `State` to rebuild its graph (replay).
 */
export default function createActivitiesGraph(nodes: Iterable<GraphNode> = []): ActivitiesGraph {
  let controllerEdit: ActivitiesGraph['edit'] | undefined;

  const store = new Store({
    start(controller) {
      controllerEdit = transactor => controller.edit(transactor);
    }
  });

  if (!controllerEdit) {
    throw new Error('botframework-webchat: The store did not start its source synchronously');
  }

  const edit = controllerEdit;
  const initialNodes = new Map(Array.from(nodes, node => [node['@id'], node]));

  initialNodes.size &&
    edit(transaction => {
      // Parents first, without `hasPart`: each part adds itself to its parent with `isPartOf` (see `sortParentsFirst()`).
      for (const node of sortParentsFirst(initialNodes.values(), id => initialNodes.get(id))) {
        transaction.upsert(node['@id'], () => withProperties(node, { hasPart: undefined }));
      }
    });

  return Object.freeze({ edit, store });
}

export { CONVERSATION_ID, type ActivitiesGraph };
