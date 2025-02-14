import deepFreeze from 'deep-freeze-strict';

import { type BlankNode } from './BlankNode';
import getSafeOwnPropertyNames from './getSafeOwnPropertyNames';
import isBlankNode from './isBlankNode';
import isUnconnectedBlankNode from './isUnconnectedBlankNode';
import visitOnce from './visitOnce';

function dereferenceBlankNodesInline(objects: object[]): void {
  const blankNodeIdMap = new Map<string, BlankNode>();

  const objectsToVisit1: any[] = [objects];
  const shouldVisit1 = visitOnce<object>();

  while (objectsToVisit1.length) {
    const object = objectsToVisit1.shift();

    if (!object) {
      continue;
    }

    const indices = getSafeOwnPropertyNames(object);

    for (const index of indices) {
      // eslint-disable-next-line security/detect-object-injection
      const value = object[index];

      if (isBlankNode(value) && !isUnconnectedBlankNode(value)) {
        blankNodeIdMap.set(value['@id'], value);
      }

      shouldVisit1(value) && objectsToVisit1.push(value);
    }
  }

  const objectsToVisit2: unknown[] = [objects];
  const shouldVisit2 = visitOnce<object>();

  while (objectsToVisit2.length) {
    const object = objectsToVisit2.shift();

    if (!object) {
      continue;
    }

    const indices = getSafeOwnPropertyNames(object);

    for (const index of indices) {
      // eslint-disable-next-line security/detect-object-injection
      const value = object[index];

      if (isBlankNode(value) && isUnconnectedBlankNode(value)) {
        const blankNode = blankNodeIdMap.get(value['@id']);

        if (blankNode) {
          // eslint-disable-next-line security/detect-object-injection
          object[index] = blankNode;
        }
      } else {
        shouldVisit2(value) && objectsToVisit2.push(value);
      }
    }
  }
}

/**
 * Dereferences all unconnected blank nodes to their corresponding blank node. This is done by replacing all unconnected blank nodes in a graph and purposefully introduce cyclic dependencies to help querying the graph.
 *
 * This function will always return a new instance of all objects in the graph.
 *
 * This function assumes the graph conforms to JSON-LD, notably:
 *
 * - For nodes that share the same blank node identifier, one of them should be connected and the other must be unconnected
 * - If none of them are connected node, these unconnected blank node will not be replaced
 *
 * @see https://json-ld.github.io/json-ld.org/spec/latest/json-ld/#data-model-overview
 * @param graph A list of nodes in the graph.
 * @returns A structured clone of graph with unconnected blank nodes replaced by their corresponding blank node.
 */
export default function dereferenceBlankNodes<T extends Record<any, any>>(graph: T[]): readonly T[] {
  const nextObjects = structuredClone(graph);

  dereferenceBlankNodesInline(nextObjects);

  return deepFreeze(nextObjects);
}
