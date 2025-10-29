/* eslint no-restricted-syntax: ["error", {
  "selector": "CallExpression[callee.object.type='Identifier'][callee.object.name='Map'][callee.property.name='set']",
  "message": "Map.set() is restricted, use this.#setGraphNode instead"
}, {
  "selector": "CallExpression[callee.object.type='MemberExpression'][callee.property.name='set']",
  "message": "Map.set() is restricted, use this.#setGraphNode instead"
}] */

import { parse } from 'valibot';

import colorNode, { type SlantNode } from './schemas/colorNode';
import type { Identifier } from './schemas/Identifier';
import { nodeReference, type NodeReference } from './schemas/NodeReference';

type GraphChangeEvent = { readonly ids: readonly Identifier[] };

function nodeReferenceListToIdentifierSet(nodeReferences: readonly NodeReference[]): Set<Identifier> {
  return new Set(nodeReferences.map(ref => ref['@id']));
}

function identifierSetToNodeReferenceList(identifierSet: ReadonlySet<Identifier>): readonly NodeReference[] {
  return Object.freeze(
    Array.from(identifierSet.values().map(identifier => parse(nodeReference(), { '@id': identifier })))
  );
}

class Graph extends EventTarget {
  constructor() {
    super();

    this.#graph = new Map();
    this.#observerControllerSet = new Set();
  }

  #graph: Map<Identifier, SlantNode>;
  #observerControllerSet: Set<ReadableStreamDefaultController<GraphChangeEvent>>;

  #setGraphNode(node: SlantNode) {
    // We need to recolor the node as it could lose its color over time, e.g. empty array -> remove.
    const safeNode = colorNode(node);

    // eslint-disable-next-line no-restricted-syntax
    this.#graph.set(safeNode['@id'], safeNode);
  }

  observe(): AsyncIterator<GraphChangeEvent, any, any> {
    const observerControllerSet = this.#observerControllerSet;
    let thisController: ReadableStreamDefaultController<GraphChangeEvent>;

    const stream = new ReadableStream<GraphChangeEvent>({
      cancel() {
        // Iterator.cancel() will call cancel().
        observerControllerSet.delete(thisController);
      },
      start(controller) {
        thisController = controller;
        observerControllerSet.add(controller);
      }
    });

    return stream.values();
  }

  snapshot() {
    return new Map(this.#graph);
  }

  #setEdge(
    subjectId: Identifier,
    linkType: 'hasPart' | 'isPartOf',
    objectId: Identifier,
    operation: 'add' | 'delete'
  ): ReadonlySet<Identifier> {
    const subject = this.#graph.get(subjectId);

    if (!subject) {
      throw new Error(`Cannot find subject with @id of "${subjectId}"`);
    }

    const object = this.#graph.get(objectId);

    if (!object) {
      throw new Error(`Cannot find object with @id of "${objectId}"`);
    }

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
      } else {
        operation satisfies 'delete';

        if (subjectHasPart.has(objectId)) {
          subjectHasPart.delete(objectId);
          nextSubject = { ...subject, hasPart: identifierSetToNodeReferenceList(subjectHasPart) };
        }

        if (objectIsPartOf.has(subjectId)) {
          objectIsPartOf.delete(subjectId);
          nextObject = { ...object, isPartOf: identifierSetToNodeReferenceList(objectIsPartOf) };
        }
      }
    } else {
      linkType satisfies 'isPartOf';

      if (operation === 'add') {
        if (!subjectIsPartOf.has(objectId)) {
          subjectIsPartOf.add(objectId);
          nextSubject = { ...subject, isPartOf: identifierSetToNodeReferenceList(subjectIsPartOf) };
        }

        if (!objectHasPart.has(subjectId)) {
          objectHasPart.add(subjectId);
          nextObject = { ...object, hasPart: identifierSetToNodeReferenceList(objectHasPart) };
        }
      } else {
        operation satisfies 'delete';

        if (subjectIsPartOf.has(objectId)) {
          subjectIsPartOf.delete(objectId);
          nextSubject = { ...subject, isPartOf: identifierSetToNodeReferenceList(subjectIsPartOf) };
        }

        if (objectHasPart.has(subjectId)) {
          objectHasPart.delete(subjectId);
          nextObject = { ...object, hasPart: identifierSetToNodeReferenceList(objectHasPart) };
        }
      }
    }

    const affectedIds = new Set<Identifier>();

    if (nextObject) {
      this.#setGraphNode(nextObject);
      affectedIds.add(nextObject['@id']);
    }

    if (nextSubject) {
      this.#setGraphNode(nextSubject);
      affectedIds.add(nextSubject['@id']);
    }

    return Object.freeze(affectedIds);
  }

  /**
   * Upserts a list of nodes in a transaction. Will trigger observers once upsert has completed.
   *
   * @param nodes Nodes to upsert.
   */
  upsert(...nodes: readonly SlantNode[]) {
    const affectedIdSet: Set<Identifier> = new Set();
    const markIdAsAffected = affectedIdSet.add.bind(affectedIdSet);

    for (const node of nodes) {
      const id = node['@id'];

      if (affectedIdSet.has(id)) {
        throw new Error('Cannot upsert two or more nodes with same @id');
      }

      affectedIdSet.add(id);

      const existingNode = this.#graph.get(id);

      if (existingNode) {
        const removedHasPartIdSet = nodeReferenceListToIdentifierSet(existingNode.hasPart || []).difference(
          nodeReferenceListToIdentifierSet(node.hasPart || [])
        );

        for (const removedHasPartId of removedHasPartIdSet) {
          this.#setEdge(existingNode['@id'], 'hasPart', removedHasPartId, 'delete').values().forEach(markIdAsAffected);
        }

        const removedIsPartOfIdSet = nodeReferenceListToIdentifierSet(existingNode.isPartOf || []).difference(
          nodeReferenceListToIdentifierSet(node.isPartOf || [])
        );

        for (const removedIsPartOfId of removedIsPartOfIdSet) {
          this.#setEdge(existingNode['@id'], 'isPartOf', removedIsPartOfId, 'delete')
            .values()
            .forEach(markIdAsAffected);
        }
      }

      this.#setGraphNode(node);
    }

    for (const node of nodes) {
      const nodeId = node['@id'];

      for (const { '@id': childId } of node.hasPart || []) {
        this.#setEdge(nodeId, 'hasPart', childId, 'add').values().forEach(markIdAsAffected);
      }

      for (const { '@id': parentId } of node.isPartOf || []) {
        this.#setEdge(nodeId, 'isPartOf', parentId, 'add').values().forEach(markIdAsAffected);
      }
    }

    const affectedIds = Object.freeze(Array.from(affectedIdSet.values()));

    for (const id of affectedIds) {
      if (!this.#graph.has(id)) {
        throw new Error(`ASSERTION: Cannot find affected node with @id of "${id}"`);
      }
    }

    for (const controller of this.#observerControllerSet) {
      controller.enqueue(Object.freeze({ ids: affectedIds }));
    }
  }
}

export default Graph;
