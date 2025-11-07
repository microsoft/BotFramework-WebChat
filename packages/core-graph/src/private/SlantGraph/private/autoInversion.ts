import { type GraphMiddleware } from '../../Graph2';
import { type SlantNode } from '../../schemas/colorNode';
import type { Identifier } from '../../schemas/Identifier';
import { type NodeReference } from '../../schemas/NodeReference';
import type { AnyNode } from '../SlantGraph';

function nodeReferenceListToIdentifierSet(nodeReferences: readonly NodeReference[] | undefined): Set<Identifier> {
  return new Set(nodeReferences?.map(ref => ref['@id']));
}

// TODO: [P*] Review this auto-inversing middleware.
const autoInversion: GraphMiddleware<AnyNode, SlantNode> =
  ({ getState }) =>
  () =>
  // "autoInversion" receives SlantNode instead of AnyNode because prior middleware already did the transformation.
  // @ts-expect-error
  (upsertingNodeMap: Map<Identifier, SlantNode>) => {
    const state = getState();
    const nextUpsertingNodeMap = new Map<Identifier, SlantNode>(upsertingNodeMap as any);

    function markAsChanged(...nodes: readonly SlantNode[]) {
      for (const node of nodes) {
        nextUpsertingNodeMap.set(node['@id'], node);
      }
    }

    function getDirtyNode(id: Identifier) {
      const node = (nextUpsertingNodeMap.get(id) as SlantNode | undefined) ?? state.get(id);

      if (!node) {
        throw new Error(`Cannot find node with @id "${id}"`);
      }

      return node;
    }

    function updateNode(id: Identifier, fn: (node: SlantNode) => SlantNode): boolean {
      const node = getDirtyNode(id);

      if (!node) {
        throw new Error(`Cannot find node with @id of ${id} to update`);
      }

      const nextNode = fn(node);

      if (!Object.is(node, nextNode)) {
        markAsChanged(nextNode);
      }

      return true;
    }

    for (const [id, node] of upsertingNodeMap) {
      const preCommitNode = state.get(id);

      // Remove hasPart/isPartOf if the existing node does not match the upserted node.
      if (preCommitNode) {
        const removedHasPartIdSet = nodeReferenceListToIdentifierSet(preCommitNode.hasPart).difference(
          nodeReferenceListToIdentifierSet(node.hasPart)
        );

        for (const removedHasPartId of removedHasPartIdSet) {
          updateNode(removedHasPartId, childNode => {
            const { isPartOf, ...childNodeWithoutIsPartOf } = childNode;

            if (isPartOf) {
              const nextIsPartOf = isPartOf.filter(ref => ref['@id'] !== id);

              if (isPartOf.length !== nextIsPartOf.length) {
                return Object.freeze({
                  ...childNodeWithoutIsPartOf,
                  ...(nextIsPartOf.length ? { isPartOf: nextIsPartOf } : {})
                });
              }
            }

            return childNode;
          });
        }

        const removedIsPartOfIdSet = nodeReferenceListToIdentifierSet(preCommitNode.isPartOf).difference(
          nodeReferenceListToIdentifierSet(node.isPartOf)
        );

        for (const removedIsPartOfId of removedIsPartOfIdSet) {
          updateNode(removedIsPartOfId, parentNode => {
            const { hasPart, ...parentNodeWithoutHasPart } = parentNode;

            if (hasPart) {
              const nextHasPart = hasPart.filter(ref => ref['@id'] !== id);

              if (hasPart.length !== nextHasPart.length) {
                return Object.freeze({
                  ...parentNodeWithoutHasPart,
                  ...(nextHasPart.length ? { hasPart: nextHasPart } : {})
                });
              }
            }

            return parentNode;
          });
        }
      }

      const addedHasPartIdSet = nodeReferenceListToIdentifierSet(node.hasPart).difference(
        nodeReferenceListToIdentifierSet(preCommitNode?.hasPart ?? [])
      );

      for (const addedHasPartId of addedHasPartIdSet) {
        updateNode(addedHasPartId, childNode => {
          if (childNode.isPartOf?.find(ref => ref['@id'] === id)) {
            return childNode;
          }

          return Object.freeze({
            ...childNode,
            isPartOf: Object.freeze([...(childNode.isPartOf ?? []), Object.freeze({ '@id': id })])
          });
        });
      }

      const addedIsPartOfIdSet = nodeReferenceListToIdentifierSet(node.isPartOf).difference(
        nodeReferenceListToIdentifierSet(preCommitNode?.isPartOf ?? [])
      );

      for (const addedIsPartOfId of addedIsPartOfIdSet) {
        updateNode(addedIsPartOfId, parentNode => {
          if (parentNode.hasPart?.find(ref => ref['@id'] === id)) {
            return parentNode;
          }

          return Object.freeze({
            ...parentNode,
            hasPart: Object.freeze([...(parentNode.hasPart ?? []), Object.freeze({ '@id': id })])
          });
        });
      }
    }

    return nextUpsertingNodeMap;
  };

export default autoInversion;
