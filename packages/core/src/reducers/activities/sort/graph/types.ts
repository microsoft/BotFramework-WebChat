import type { Store, StoreTransactor } from 'botframework-webchat-store';

// Types of William's store (`packages/store`), derived from its public exports.

type GraphStore = Store;

/** The transaction passed to `controller.edit()`. */
type GraphTransaction = Parameters<Parameters<StoreTransactor['edit']>[0]>[0];

type GraphNode = ReturnType<Store['getSnapshot']> extends Map<string, infer T> ? T : never;

type GraphIdentifier = GraphNode['@id'];

/** Reads a node, either from a snapshot or inside a transaction. */
type GetNode = (id: GraphIdentifier) => GraphNode | undefined;

export type { GetNode, GraphIdentifier, GraphNode, GraphStore, GraphTransaction };
