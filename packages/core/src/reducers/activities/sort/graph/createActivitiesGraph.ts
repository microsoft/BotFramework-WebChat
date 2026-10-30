import { Store } from 'botframework-webchat-store';
import type { GraphTransaction } from './types';

/** The conversation node every activity is part of (directly or through a grouping). */
const CONVERSATION_ID = '_:webchat:conversation';

type ActivitiesGraph = {
  /** Runs a transaction on the store. */
  readonly edit: (transactor: (transaction: GraphTransaction) => void) => void;
  readonly store: Store;
};

/**
 * Creates William's store with core as its source: core's reducer edits the graph when it receives an activity.
 *
 * `createDirectLineStore()` is not used: today it is a stub that adds a sample node.
 */
export default function createActivitiesGraph(): ActivitiesGraph {
  let edit: ActivitiesGraph['edit'] | undefined;

  const store = new Store({
    start(controller) {
      edit = transactor => controller.edit(transactor);
    }
  });

  if (!edit) {
    throw new Error('botframework-webchat: The store did not start its source synchronously');
  }

  return Object.freeze({ edit, store });
}

export { CONVERSATION_ID, type ActivitiesGraph };
