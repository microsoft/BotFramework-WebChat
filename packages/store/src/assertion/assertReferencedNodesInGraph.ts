import type { Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';

/**
 * RULE: All referenced nodes must be in the graph.
 *
 * Upserting nodes which reference each other may take multiple `upsert()` calls, thus, it is verified on commit.
 *
 * As `delete()` removes references to the deleted node, only references from affected nodes need to be checked.
 */
function assertReferencedNodesInGraph(
  state: ReadonlyMap<string, Node>,
  forwardReferenceIds: ReadonlyMap<string, ReadonlySet<Identifier>>,
  affectedNodeIds: ReadonlySet<Identifier>
): void {
  for (const nodeId of affectedNodeIds) {
    for (const referenceId of forwardReferenceIds.get(nodeId) ?? []) {
      if (!state.has(referenceId)) {
        throw new Error(`Node "${nodeId}" references node "${referenceId}" which is not in the graph`);
      }
    }
  }
}

export default assertReferencedNodesInGraph;
