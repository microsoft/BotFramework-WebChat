/* eslint no-restricted-syntax: ["error", {
  "selector": "CallExpression[callee.object.type='Identifier'][callee.object.name='Map'][callee.property.name='set']",
  "message": "Map.set() is restricted, use this.#setGraphNode instead"
}, {
  "selector": "CallExpression[callee.object.type='MemberExpression'][callee.property.name='set']",
  "message": "Map.set() is restricted, use this.#setGraphNode instead"
}] */

// TODO: [P*] This file is deprecated.

import { parse } from 'valibot';

import colorNode, { type SlantNode } from './schemas/colorNode';
import flattenNodeObject from './schemas/flattenNodeObject';
import { type Identifier } from './schemas/Identifier';
import isOfType from './schemas/isOfType';
import { MessageNodeSchema } from './schemas/MessageNode';
import { NodeReferenceSchema, type NodeReference } from './schemas/NodeReference';

type GraphChangeEvent = { readonly ids: readonly Identifier[] };

function nodeReferenceListToIdentifierSet(nodeReferences: readonly NodeReference[]): Set<Identifier> {
  return new Set(nodeReferences.map(ref => ref['@id']));
}

function identifierSetToNodeReferenceList(identifierSet: ReadonlySet<Identifier>): readonly NodeReference[] {
  return Object.freeze(
    Array.from(identifierSet.values().map(identifier => parse(NodeReferenceSchema, { '@id': identifier })))
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

    // TODO: Add a indexer for both @id and identifier.

    // eslint-disable-next-line no-restricted-syntax
    this.#graph.set(safeNode['@id'], safeNode);
  }

  // eslint-disable-next-line complexity
  #setTriplet(
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

  observe(): AsyncIterableIterator<GraphChangeEvent, any, any> {
    const observerControllerSet = this.#observerControllerSet;
    let thisController: ReadableStreamDefaultController<GraphChangeEvent>;

    const stream = new ReadableStream<GraphChangeEvent>({
      cancel() {
        // Iterator.return() will call cancel().
        observerControllerSet.delete(thisController);
      },
      start(controller) {
        thisController = controller;
        observerControllerSet.add(controller);
      }
    });

    return stream.values();
  }

  /**
   * Takes a snapshot of the current graph.
   */
  snapshot(): ReadonlyMap<Identifier, SlantNode> {
    return Object.freeze(new Map(this.#graph));
  }

  /**
   * Gets a node from the current graph.
   */
  get(id: Identifier): SlantNode | undefined {
    return this.#graph.get(id);
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

      // Remove hasPart/isPartOf if the existing node does not match the upserted node.
      if (existingNode) {
        const removedHasPartIdSet = nodeReferenceListToIdentifierSet(existingNode.hasPart ?? []).difference(
          nodeReferenceListToIdentifierSet(node.hasPart ?? [])
        );

        for (const removedHasPartId of removedHasPartIdSet) {
          this.#setTriplet(existingNode['@id'], 'hasPart', removedHasPartId, 'delete')
            .values()
            .forEach(markIdAsAffected);
        }

        const removedIsPartOfIdSet = nodeReferenceListToIdentifierSet(existingNode.isPartOf ?? []).difference(
          nodeReferenceListToIdentifierSet(node.isPartOf ?? [])
        );

        for (const removedIsPartOfId of removedIsPartOfIdSet) {
          this.#setTriplet(existingNode['@id'], 'isPartOf', removedIsPartOfId, 'delete')
            .values()
            .forEach(markIdAsAffected);
        }
      }

      this.#setGraphNode(node);
    }

    // Add hasPart/isPartOf.
    for (const node of nodes) {
      const nodeId = node['@id'];

      for (const { '@id': childId } of node.hasPart || []) {
        this.#setTriplet(nodeId, 'hasPart', childId, 'add').values().forEach(markIdAsAffected);
      }

      for (const { '@id': parentId } of node.isPartOf || []) {
        this.#setTriplet(nodeId, 'isPartOf', parentId, 'add').values().forEach(markIdAsAffected);
      }
    }

    // ASSERT: Make sure all affected ids are in the graph.
    for (const id of affectedIdSet) {
      if (!this.#graph.has(id)) {
        throw new Error(`ASSERTION: Cannot find affected node with @id of "${id}"`);
      }
    }

    const changeEvent = Object.freeze({
      ids: Object.freeze(Array.from(affectedIdSet.values()))
    });

    for (const controller of this.#observerControllerSet) {
      controller.enqueue(changeEvent);
    }

    const event = new CustomEvent('change', { detail: changeEvent });

    this.dispatchEvent(event);
  }

  upsertRaw(...nodes: readonly object[]) {
    const slantNodes = [];

    for (const node of nodes) {
      for (const flatNode of flattenNodeObject(node).graph) {
        const slantNode = colorNode(flatNode);

        if (isOfType(slantNode, 'Message')) {
          parse(MessageNodeSchema, slantNode);
        }

        slantNodes.push(slantNode);
      }
    }

    this.upsert(...slantNodes);
  }
}

export default Graph;
