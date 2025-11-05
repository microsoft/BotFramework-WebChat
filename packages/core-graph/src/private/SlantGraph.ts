import { array, assert, fallback, parse } from 'valibot';
import Graph, { type GraphMiddleware } from './Graph2';
import colorNode, { SlantNodeSchema, type SlantNode } from './schemas/colorNode';
import flattenNodeObject from './schemas/flattenNodeObject';
import type { Identifier } from './schemas/Identifier';
import isOfType from './schemas/isOfType';
import { MessageNodeSchema } from './schemas/MessageNode';
import { NodeReferenceSchema, type NodeReference } from './schemas/NodeReference';

type AnyNode = Record<string, unknown> & {
  readonly '@id': Identifier;
  readonly '@type': string | readonly string[];
};

const VALIDATION_SCHEMAS_BY_TYPE = new Map([['Message', MessageNodeSchema]]);

const color: GraphMiddleware<AnyNode, SlantNode> = () => next => upsertingNodeMap => {
  const nextUpsertingNodeMap = new Map<Identifier, SlantNode>();

  for (const node of upsertingNodeMap.values()) {
    for (const flattenedNode of flattenNodeObject(node).graph) {
      nextUpsertingNodeMap.set(flattenedNode['@id'], colorNode(flattenedNode));
    }
  }

  return next(nextUpsertingNodeMap);
};

const validateSlantNode: GraphMiddleware<AnyNode, SlantNode> = () => next => upsertingNodeMap => {
  for (const node of upsertingNodeMap.values()) {
    assert(SlantNodeSchema, node);

    for (const [type, schema] of VALIDATION_SCHEMAS_BY_TYPE) {
      isOfType(node, type) && assert(schema, node);
    }
  }

  return next(upsertingNodeMap as ReadonlyMap<Identifier, SlantNode>);
};

function nodeReferenceListToIdentifierSet(nodeReferences: readonly NodeReference[]): Set<Identifier> {
  return new Set(nodeReferences.map(ref => ref['@id']));
}

function identifierSetToNodeReferenceList(identifierSet: ReadonlySet<Identifier>): readonly NodeReference[] {
  return Object.freeze(
    Array.from(identifierSet.values().map(identifier => parse(NodeReferenceSchema, { '@id': identifier })))
  );
}

const NodeReferenceListSchema = fallback(array(NodeReferenceSchema), []);

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
  upsertingNodeMap => {
    const state = getState();
    const nextUpsertingNodeMap = new Map<Identifier, SlantNode>(upsertingNodeMap as any);

    function addToResult(...nodes: readonly SlantNode[]) {
      for (const node of nodes) {
        nextUpsertingNodeMap.set(node['@id'], node);
      }
    }

    function getDirty(id: Identifier) {
      const node = (nextUpsertingNodeMap.get(id) as SlantNode | undefined) ?? state.get(id);

      if (!node) {
        throw new Error(`Cannot find node with @id "${id}"`);
      }

      return node;
    }

    for (const [_key, node] of upsertingNodeMap) {
      const id = node['@id'];

      const existingNode = getDirty(id);

      // Remove hasPart/isPartOf if the existing node does not match the upserted node.
      if (existingNode) {
        const removedHasPartIdSet = nodeReferenceListToIdentifierSet(existingNode.hasPart ?? []).difference(
          nodeReferenceListToIdentifierSet(parse(NodeReferenceListSchema, node['hasPart']))
        );

        for (const removedHasPartId of removedHasPartIdSet) {
          addToResult(...setTriplet(existingNode, 'hasPart', getDirty(removedHasPartId)!, 'delete'));
        }

        const removedIsPartOfIdSet = nodeReferenceListToIdentifierSet(existingNode.isPartOf ?? []).difference(
          nodeReferenceListToIdentifierSet(parse(NodeReferenceListSchema, node['isPartOf']))
        );

        for (const removedIsPartOfId of removedIsPartOfIdSet) {
          addToResult(...setTriplet(existingNode, 'isPartOf', getDirty(removedIsPartOfId)!, 'delete'));
        }
      }
    }

    // Add hasPart/isPartOf.
    for (const [_, node] of upsertingNodeMap) {
      for (const { '@id': childId } of parse(NodeReferenceListSchema, node['hasPart'])) {
        addToResult(...setTriplet(node as SlantNode, 'hasPart', getDirty(childId), 'add'));
      }

      for (const { '@id': parentId } of parse(NodeReferenceListSchema, node['isPartOf'])) {
        addToResult(...setTriplet(node as SlantNode, 'isPartOf', getDirty(parentId), 'add'));
      }
    }

    return nextUpsertingNodeMap;
  };

class SlantGraph extends Graph<AnyNode, SlantNode> {
  constructor() {
    super(color, validateSlantNode, autoInversion);
  }
}

export default SlantGraph;

export { type AnyNode as InputNode };
