import { brand, pipe, type InferOutput } from 'valibot';
import { nodeSchema } from '../node/Node.ts';

/**
 * Schema of the node stored in the graph, i.e. the "internal version" of the node.
 *
 * It looks the same as `Node`, but it is deeply frozen and has hidden properties attached (e.g. cached `dateCreated`
 * and sorted children). The brand is type-only, it differentiates it from the "external version" which could be
 * created by anyone, so internal functions relying on hidden properties will only accept nodes created by
 * `createNode()` or `attachHasPart()`.
 *
 * `InternalNode` is assignable to `Node`, but `Node` is not assignable to `InternalNode`.
 */
const internalNodeSchema = pipe(nodeSchema, brand('InternalNode'));

type InternalNode = InferOutput<typeof internalNodeSchema>;

export { internalNodeSchema, type InternalNode };
