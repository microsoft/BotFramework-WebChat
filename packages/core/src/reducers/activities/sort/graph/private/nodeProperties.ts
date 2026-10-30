import type { WebChatActivity } from '../../../../../types/WebChatActivity';
import type { GraphIdentifier, GraphNode } from '../types';
import { DIRECT_LINE_ACTIVITY, IDENTIFIER } from '../vocabulary';

// Reads trust the store: every node was validated by `upsertNode()` (William's `nodeSchema`), so property values are
// arrays and these helpers only check the type of the first value. They run on every node of every action, so they
// do not use valibot (profiled: valibot was 45 % of the time when they did).

function getFirstValue(node: GraphNode | undefined, property: string): unknown {
  // eslint-disable-next-line security/detect-object-injection
  const values = node?.[property];

  return Array.isArray(values) ? values[0] : undefined;
}

function getBoolean(node: GraphNode | undefined, property: string): boolean {
  return getFirstValue(node, property) === true;
}

function getNumber(node: GraphNode | undefined, property: string): number | undefined {
  const value = getFirstValue(node, property);

  return typeof value === 'number' ? value : undefined;
}

function getString(node: GraphNode | undefined, property: string): string | undefined {
  const value = getFirstValue(node, property);

  return typeof value === 'string' ? value : undefined;
}

/** The sender's ID of a HowTo grouping or a livestream session. */
function getIdentifier(node: GraphNode | undefined): string | undefined {
  return getString(node, IDENTIFIER);
}

/** The activity boxed in the node (JSON literal), as written by `toActivityNode()`. */
function getBoxedActivity(node: GraphNode | undefined): WebChatActivity | undefined {
  const literal = getFirstValue(node, DIRECT_LINE_ACTIVITY);
  const value = literal && typeof literal === 'object' && '@value' in literal ? literal['@value'] : undefined;

  return value && typeof value === 'object' ? (value satisfies object as WebChatActivity) : undefined;
}

/** In the ordering tree, a node is part of at most one parent. */
function getParentId(node: GraphNode | undefined): GraphIdentifier | undefined {
  let parentId: GraphIdentifier | undefined;

  // `forEach` instead of `for...of`: this runs for many nodes per action, and transpiled `for...of` over a `Set` is slow.
  node?.isPartOf?.forEach(reference => {
    parentId = parentId ?? reference['@id'];
  });

  return parentId;
}

function hasType(node: GraphNode | undefined, type: string): boolean {
  return !!node?.['@type'].has(type);
}

function toNumberValues(value: number | undefined): readonly number[] | undefined {
  return typeof value === 'undefined' ? undefined : Object.freeze([value]);
}

/**
 * Returns a copy of the node with the properties set. `undefined` and empty values remove the property, as the store
 * treats them as removed. The store validates the node on `upsertNode()`.
 */
function withProperties(node: GraphNode, properties: Readonly<Record<string, unknown>>): GraphNode {
  const nextNode: Record<string, unknown> = { ...node };

  for (const [key, value] of Object.entries(properties)) {
    if (
      typeof value === 'undefined' ||
      (Array.isArray(value) && !value.length) ||
      (value instanceof Set && !value.size)
    ) {
      // eslint-disable-next-line security/detect-object-injection
      delete nextNode[key];
    } else {
      // eslint-disable-next-line security/detect-object-injection
      nextNode[key] = value;
    }
  }

  return nextNode satisfies Record<string, unknown> as GraphNode;
}

export {
  getBoolean,
  getBoxedActivity,
  getIdentifier,
  getNumber,
  getParentId,
  getString,
  hasType,
  toNumberValues,
  withProperties
};
