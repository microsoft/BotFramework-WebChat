import { array, object, parse, pipe, safeParse, type InferOutput } from 'valibot';

import { expandedFlatNodeObjectSchema, type ExpandedFlatNodeObject } from './schemas/expandArray';
import type { Identifier } from './schemas/Identifier';
import identifier from './schemas/Identifier';
import { nodeReference } from './schemas/NodeReference';
import freeze from './schemas/private/freeze';

type ObserverChange = readonly ExpandedFlatNodeObject[];

const childNodeSchema = pipe(object({ isPartOf: pipe(array(nodeReference()), freeze()) }), freeze());

type ChildNode = InferOutput<typeof childNodeSchema>;

function isChild(node: unknown): node is ChildNode {
  return safeParse(childNodeSchema, node).success;
}

const parentNodeSchema = pipe(object({ hasPart: pipe(array(nodeReference()), freeze()) }), freeze());
type ParentNode = InferOutput<typeof parentNodeSchema>;

function isParent(node: unknown): node is ParentNode {
  return safeParse(parentNodeSchema, node).success;
}

class Graph extends EventTarget {
  constructor() {
    super();

    this.#graph = new Map();
    this.#observerControllerSet = new Set();
  }

  #graph: Map<Identifier, ExpandedFlatNodeObject>;
  #observerControllerSet: Set<ReadableStreamDefaultController<ObserverChange>>;

  observe(): AsyncIterator<readonly ExpandedFlatNodeObject[], any, any> {
    const observerControllerSet = this.#observerControllerSet;
    let thisController: ReadableStreamDefaultController<ObserverChange>;

    const stream = new ReadableStream<ObserverChange>({
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

  upsert(...nodes: readonly ExpandedFlatNodeObject[]) {
    const affectedNodeIds: Set<Identifier> = new Set();

    for (const node of nodes) {
      this.#graph.set(parse(identifier(), node['@id']), node);

      affectedNodeIds.add(node['@id'] as Identifier);
    }

    for (const node of nodes) {
      if (isParent(node)) {
        const parentId = node['@id'] as Identifier;

        for (const { '@id': childId } of node.hasPart) {
          const child = this.#graph.get(childId);

          if (!child) {
            throw new Error(`Cannot find child with @id of ${childId}`);
          } else {
            const parentIds: Set<Identifier> = new Set(isChild(child) ? child.isPartOf.map(ref => ref['@id']) : []);

            if (!parentIds.has(parentId)) {
              parentIds.add(parentId);

              this.#graph.set(
                childId,
                parse(expandedFlatNodeObjectSchema, {
                  ...child,
                  isPartOf: Array.from(parentIds.values()).map(id => ({ '@id': id }))
                })
              );

              affectedNodeIds.add(child['@id'] as Identifier);
            }
          }
        }
      }

      if (isChild(node)) {
        const childId = node['@id'] as Identifier;

        for (const { '@id': parentId } of node.isPartOf) {
          const parent = this.#graph.get(parentId);

          if (!parent) {
            throw new Error(`Cannot find parent with @id of ${parentId}`);
          } else {
            const parentIds: Set<Identifier> = new Set(isParent(parent) ? parent.hasPart.map(ref => ref['@id']) : []);

            if (!parentIds.has(childId)) {
              parentIds.add(childId);

              this.#graph.set(
                parentId,
                parse(expandedFlatNodeObjectSchema, {
                  ...parent,
                  hasPart: Array.from(parentIds.values()).map(id => ({ '@id': id }))
                })
              );

              affectedNodeIds.add(parent['@id'] as Identifier);
            }
          }
        }
      }
    }

    const affectedNodes = Object.freeze(
      Array.from(affectedNodeIds.values()).map(id => {
        const node = this.#graph.get(id);

        if (!node) {
          throw new Error(`ASSERTION: Cannot find affected node with @id of "${id}"`);
        }

        return node;
      })
    );

    for (const controller of this.#observerControllerSet) {
      controller.enqueue(affectedNodes);
    }
  }
}

export default Graph;
