import { parse } from 'valibot';
import { type GraphMiddleware } from '../../Graph2';
import { type SlantNode } from '../../schemas/colorNode';
import type { Identifier } from '../../schemas/Identifier';
import { NodeReferenceSchema, type NodeReference } from '../../schemas/NodeReference';
import type { AnyNode } from '../SlantGraph';

function nodeReferenceListToIdentifierSet(nodeReferences: readonly NodeReference[]): Set<Identifier> {
  return new Set(nodeReferences.map(ref => ref['@id']));
}

function identifierSetToNodeReferenceList(identifierSet: ReadonlySet<Identifier>): readonly NodeReference[] {
  return Object.freeze(
    Array.from(identifierSet.values().map(identifier => parse(NodeReferenceSchema, { '@id': identifier })))
  );
}

// eslint-disable-next-line complexity
function setTriplet(
  subject: SlantNode,
  linkType: 'hasPart' | 'isPartOf',
  object: SlantNode,
  operation: 'add' | 'delete'
): readonly SlantNode[] {
  const objectId = object['@id'];
  const subjectId = subject['@id'];

  let nextObject: SlantNode | undefined;
  let nextSubject: SlantNode | undefined;

  const objectHasPart = nodeReferenceListToIdentifierSet(object.hasPart || []);
  const objectIsPartOf = nodeReferenceListToIdentifierSet(object.isPartOf || []);
  const subjectHasPart = nodeReferenceListToIdentifierSet(subject.hasPart || []);
  const subjectIsPartOf = nodeReferenceListToIdentifierSet(subject.isPartOf || []);

  if (linkType === 'hasPart') {
    if (operation === 'add') {
      if (!subjectHasPart.has(objectId)) {
        subjectHasPart.add(objectId);
        nextSubject = { ...subject, hasPart: identifierSetToNodeReferenceList(subjectHasPart) };
      }

      if (!objectIsPartOf.has(subjectId)) {
        objectIsPartOf.add(subjectId);
        nextObject = { ...object, isPartOf: identifierSetToNodeReferenceList(objectIsPartOf) };
      }
    } else if (operation === 'delete') {
      if (subjectHasPart.has(objectId)) {
        subjectHasPart.delete(objectId);
        nextSubject = { ...subject, hasPart: identifierSetToNodeReferenceList(subjectHasPart) };
      }

      if (objectIsPartOf.has(subjectId)) {
        objectIsPartOf.delete(subjectId);
        nextObject = { ...object, isPartOf: identifierSetToNodeReferenceList(objectIsPartOf) };
      }
    } else {
      operation satisfies never;
    }
  } else if (linkType === 'isPartOf') {
    if (operation === 'add') {
      if (!subjectIsPartOf.has(objectId)) {
        subjectIsPartOf.add(objectId);
        nextSubject = { ...subject, isPartOf: identifierSetToNodeReferenceList(subjectIsPartOf) };
      }

      if (!objectHasPart.has(subjectId)) {
        objectHasPart.add(subjectId);
        nextObject = { ...object, hasPart: identifierSetToNodeReferenceList(objectHasPart) };
      }
    } else if (operation === 'delete') {
      if (subjectIsPartOf.has(objectId)) {
        subjectIsPartOf.delete(objectId);
        nextSubject = { ...subject, isPartOf: identifierSetToNodeReferenceList(subjectIsPartOf) };
      }

      if (objectHasPart.has(subjectId)) {
        objectHasPart.delete(subjectId);
        nextObject = { ...object, hasPart: identifierSetToNodeReferenceList(objectHasPart) };
      }
    } else {
      operation satisfies never;
    }
  } else {
    linkType satisfies never;
  }

  return Object.freeze([nextObject, nextSubject].filter(Boolean as unknown as (node: unknown) => node is SlantNode));
}

// TODO: [P*] Review this auto-inversing middleware.
const autoInversion: GraphMiddleware<AnyNode, SlantNode> =
  ({ getState }) =>
  () =>
  // "autoInversion" receives SlantNode instead of AnyNode because prior middleware already did the transformation.
  // @ts-expect-error
  (upsertingNodeMap: Map<Identifier, SlantNode>) => {
    const state = getState();
    const nextUpsertingNodeMap = new Map(upsertingNodeMap as any);

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

    for (const [_key, node] of upsertingNodeMap) {
      const id = node['@id'];

      const existingNode = getDirtyNode(id);

      // Remove hasPart/isPartOf if the existing node does not match the upserted node.
      if (existingNode) {
        const removedHasPartIdSet = nodeReferenceListToIdentifierSet(existingNode.hasPart ?? []).difference(
          nodeReferenceListToIdentifierSet(node['hasPart'] ?? [])
        );

        for (const removedHasPartId of removedHasPartIdSet) {
          markAsChanged(...setTriplet(existingNode, 'hasPart', getDirtyNode(removedHasPartId)!, 'delete'));
        }

        const removedIsPartOfIdSet = nodeReferenceListToIdentifierSet(existingNode.isPartOf ?? []).difference(
          nodeReferenceListToIdentifierSet(node['isPartOf'] ?? [])
        );

        for (const removedIsPartOfId of removedIsPartOfIdSet) {
          markAsChanged(...setTriplet(existingNode, 'isPartOf', getDirtyNode(removedIsPartOfId)!, 'delete'));
        }
      }
    }

    // Add hasPart/isPartOf.
    for (const [_, node] of upsertingNodeMap) {
      for (const { '@id': childId } of node['hasPart'] ?? []) {
        markAsChanged(...setTriplet(node as SlantNode, 'hasPart', getDirtyNode(childId), 'add'));
      }

      for (const { '@id': parentId } of node['isPartOf'] ?? []) {
        markAsChanged(...setTriplet(node as SlantNode, 'isPartOf', getDirtyNode(parentId), 'add'));
      }
    }

    return nextUpsertingNodeMap;
  };

export default autoInversion;
