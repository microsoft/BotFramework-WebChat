import { array, boolean, is, looseObject, number, string } from 'valibot';
import type { WebChatActivity } from '../../../../../types/WebChatActivity';
import type { GraphIdentifier, GraphNode } from '../types';
import { DIRECT_LINE_ACTIVITY, IDENTIFIER } from '../vocabulary';

const booleanValuesSchema = array(boolean());
const numberValuesSchema = array(number());
const stringValuesSchema = array(string());
const activityValuesSchema = array(looseObject({ '@type': string(), '@value': looseObject({ type: string() }) }));

function getBoolean(node: GraphNode | undefined, property: string): boolean {
  // eslint-disable-next-line security/detect-object-injection
  const values = node?.[property];

  return is(booleanValuesSchema, values) && values[0] === true;
}

function getNumber(node: GraphNode | undefined, property: string): number | undefined {
  // eslint-disable-next-line security/detect-object-injection
  const values = node?.[property];

  return is(numberValuesSchema, values) ? values[0] : undefined;
}

function getString(node: GraphNode | undefined, property: string): string | undefined {
  // eslint-disable-next-line security/detect-object-injection
  const values = node?.[property];

  return is(stringValuesSchema, values) ? values[0] : undefined;
}

/** The sender's ID of a HowTo grouping or a livestream session. */
function getIdentifier(node: GraphNode | undefined): string | undefined {
  return getString(node, IDENTIFIER);
}

/** The activity boxed in the node (JSON literal). */
function getActivity(node: GraphNode | undefined): WebChatActivity | undefined {
  // eslint-disable-next-line security/detect-object-injection
  const values = node?.[DIRECT_LINE_ACTIVITY];

  // Core boxes the activity itself (`toActivityNode()`); the check guards against other writers.
  return is(activityValuesSchema, values) && values[0]?.['@type'] === '@json'
    ? (values[0]['@value'] satisfies object as WebChatActivity)
    : undefined;
}

/** In the ordering tree, a node is part of at most one parent. */
function getParentId(node: GraphNode | undefined): GraphIdentifier | undefined {
  const [parent] = node?.isPartOf ?? [];

  return parent?.['@id'];
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
  getActivity,
  getBoolean,
  getIdentifier,
  getNumber,
  getParentId,
  getString,
  hasType,
  toNumberValues,
  withProperties
};
