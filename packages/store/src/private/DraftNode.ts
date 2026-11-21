import { brand, pipe, type InferOutput } from 'valibot';
import { nodeSchema } from '../node/Node.ts';

/**
 * Schema of a validated node which is not frozen yet, i.e. created by `createDraftNode()` and before `commitDraft()`.
 *
 * It looks the same as `FrozenNode`, all property values are deeply frozen and `hasPart`/`isPartOf` are
 * `FrozenNodeSet`, but the node object itself is not frozen, so it could be modified in place without copying. The
 * brand is type-only, it prevents a draft node from being stored in the graph, as `DraftNode` is not assignable to
 * `FrozenNode`.
 *
 * A draft node is owned by a single draft, it must never be exposed to userland.
 */
const draftNodeSchema = pipe(nodeSchema, brand('DraftNode'));

type DraftNode = InferOutput<typeof draftNodeSchema>;

export { draftNodeSchema, type DraftNode };
