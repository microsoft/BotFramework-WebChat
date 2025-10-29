/* eslint no-restricted-syntax: ["error", {
  "selector": "CallExpression[callee.object.type='Identifier'][callee.object.name='Map'][callee.property.name='set']",
  "message": "Map.set() is restricted, use this.#setGraphNode instead"
}, {
  "selector": "CallExpression[callee.object.type='MemberExpression'][callee.property.name='set']",
  "message": "Map.set() is restricted, use this.#setGraphNode instead"
}] */

import { parse } from 'valibot';

import { slantNode, type SlantNode } from './schemas/colorNode';
import type { Identifier } from './schemas/Identifier';

type GraphChangeEvent = { readonly ids: readonly Identifier[] };

class Graph extends EventTarget {
  constructor() {
    super();

    this.#graph = new Map();
    this.#observerControllerSet = new Set();
  }

  #graph: Map<Identifier, SlantNode>;
  #observerControllerSet: Set<ReadableStreamDefaultController<GraphChangeEvent>>;

  #setGraphNode(node: SlantNode) {
    const safeNode = parse(slantNode(), node);

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

  upsert(...nodes: readonly SlantNode[]) {
    const affectedIdSet: Set<Identifier> = new Set();

    for (const node of nodes) {
      this.#setGraphNode(node);

      affectedIdSet.add(node['@id']);
    }

    for (const node of nodes) {
      const nodeId = node['@id'];

      for (const { '@id': childId } of node.hasPart || []) {
        const child = this.#graph.get(childId);

        if (!child) {
          throw new Error(`Cannot find node denoted by node[@id="${nodeId}"].hasPart[@id="${childId}"]`, {
            cause: { node }
          });
        }

        const parentIds: Set<Identifier> = new Set(child.isPartOf?.map(ref => ref['@id']) || []);

        if (!parentIds.has(nodeId)) {
          parentIds.add(nodeId);

          this.#setGraphNode({ ...child, isPartOf: Array.from(parentIds.values()).map(id => ({ '@id': id })) });

          affectedIdSet.add(child['@id']);
        }
      }

      for (const { '@id': parentId } of node.isPartOf || []) {
        const parent = this.#graph.get(parentId);

        if (!parent) {
          throw new Error(`Cannot find node denoted by node[@id="${nodeId}"].isPartOf[@id="${parentId}"]`, {
            cause: { node }
          });
        }

        const parentIds: Set<Identifier> = new Set(parent.hasPart?.map(ref => ref['@id']) || []);

        if (!parentIds.has(nodeId)) {
          parentIds.add(nodeId);

          this.#setGraphNode({ ...parent, hasPart: Array.from(parentIds.values()).map(id => ({ '@id': id })) });

          affectedIdSet.add(parent['@id']);
        }
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
