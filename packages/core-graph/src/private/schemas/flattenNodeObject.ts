// TODO: [P0] This flattening can probably fold into `colorNode()` as it has slanted view of the system.

import { v4 } from 'uuid';
import { assert, check, looseObject, object, optional, parse, pipe, safeParse } from 'valibot';

import { FlatNodeObjectSchema, type FlatNodeObject, type FlatNodeObjectPropertyValue } from './FlatNodeObject';
import { IdentifierSchema, type Identifier } from './Identifier';
import { JSONLiteralSchema, type JSONLiteral } from './JSONLiteral';
import { LiteralSchema, type Literal } from './Literal';
import { isNodeReference, NodeReferenceSchema, type NodeReference } from './NodeReference';
import isPlainObject from './private/isPlainObject';

function randomUUID(): string {
  // crypto.randomUUID() requires HTTPS context.
  // However, our legacy Jest tests are not running over HTTPS.
  return v4();
}

type FlattenNodeObjectInput = Literal | (object & { '@id'?: string });

function flattenNodeObject_<T extends Literal>(
  input: T,
  graphMap: Map<string, FlatNodeObject>,
  refMap: Map<FlattenNodeObjectInput, NodeReference>
): T;

function flattenNodeObject_(
  input: FlattenNodeObjectInput,
  graphMap: Map<string, FlatNodeObject>,
  refMap: Map<FlattenNodeObjectInput, NodeReference>
): NodeReference;

function flattenNodeObject_(
  input: JSONLiteral,
  graphMap: Map<string, FlatNodeObject>,
  refMap: Map<FlattenNodeObjectInput, NodeReference>
): JSONLiteral;

function flattenNodeObject_(
  input: FlattenNodeObjectInput | Literal,
  graphMap: Map<string, FlatNodeObject>,
  refMap: Map<FlattenNodeObjectInput, NodeReference>
): JSONLiteral | Literal | NodeReference;

function flattenNodeObject_(
  input: FlattenNodeObjectInput | Literal,
  graphMap: Map<string, FlatNodeObject>,
  refMap: Map<FlattenNodeObjectInput, NodeReference>
): JSONLiteral | Literal | NodeReference {
  const parseAsLiteralResult = safeParse(LiteralSchema, input);

  if (parseAsLiteralResult.success) {
    return parseAsLiteralResult.output;
  }

  const parseAsJSONLiteralResult = safeParse(
    pipe(
      JSONLiteralSchema,
      check(value => isPlainObject(value))
    ),
    input
  );

  if (parseAsJSONLiteralResult.success) {
    return parseAsJSONLiteralResult.output;
  }

  const parseAsNodeReferenceResult = safeParse(NodeReferenceSchema, input);

  if (parseAsNodeReferenceResult.success) {
    return parseAsNodeReferenceResult.output;
  }

  // This is for TypeScript only because safeParse().success is not a type predicate.
  input = input as object;

  // Array is allowed by valibot.object({}), we need to check for plain object first.
  if (!isPlainObject(input) || !safeParse(object({}), input).success) {
    // TODO: [P0] For "undefined", maybe we just want to remove it or just set it to null.
    //       Or we should consolidate `colorNode` here as `colorNode` will handle that.
    const error = new Error(
      `Only literals, JSON literals, and plain object can be flattened: ${JSON.stringify(input)}`
    );

    error.cause = { input };

    throw error;
  }

  const existingObjectReference = refMap.get(input);

  if (existingObjectReference) {
    return existingObjectReference;
  }

  const id =
    parse(
      optional(IdentifierSchema),
      (input && typeof input === 'object' && '@id' in input && input['@id']) || undefined
    ) ?? `_:${randomUUID()}`;

  if (graphMap.get(id)) {
    console.warn(`Object [@id="${id}"] has already added to the graph.`);
  }

  // We want to reserve the top position for root object. We will set it later.
  // @ts-expect-error
  graphMap.set(id, undefined);

  const targetMap = new Map<string, FlatNodeObjectPropertyValue>();

  for (const [key, value] of Object.entries(input)) {
    let parsedValue: FlatNodeObjectPropertyValue;

    if (Array.isArray(value)) {
      const resultArray: (JSONLiteral | Literal | NodeReference)[] = [];

      for (const element of value) {
        resultArray.push(flattenNodeObject_(element, graphMap, refMap));
      }

      parsedValue = Object.freeze(resultArray);

      targetMap.set(key, parsedValue);
    } else if (typeof value !== 'undefined') {
      parsedValue = flattenNodeObject_(value, graphMap, refMap);

      targetMap.set(key, parsedValue);
    }
  }

  // const id = parse(optional(IdentifierSchema), targetMap.get('@id')) ?? `_:${randomUUID()}`;

  targetMap.set('@id', id);

  const output: FlatNodeObject = parse(FlatNodeObjectSchema, Object.fromEntries(Array.from(targetMap)));
  const nodeRef = parse(NodeReferenceSchema, Object.freeze({ '@id': id }));

  graphMap.set(id, output);
  refMap.set(input, nodeRef);

  return nodeRef;
}

type FlattenNodeObjectReturnValue = {
  /** A graph consists of one or more objects. */
  readonly graph: readonly FlatNodeObject[];
  /** A node reference object of the input. */
  readonly output: NodeReference;
};

/**
 * Flattens a node object into a graph of one or more objects.
 *
 * The output graph is JSON-LD compliant, however, it is not strictly flattened.
 *
 * Notes:
 *
 * - All nodes has `@id` and are linked without orphans.
 * - Does not completely strictly follow JSON-LD flattening strategy.
 *    - The result is parseable as JSON-LD, just not "perfectly flattened JSON-LD".
 * - Does not support every syntax in JSON-LD, such as `@value`.
 * - Node references are *not* flattened to string such as `"_:b1"`, instead, it will be kept as `{ "@id": "_:b1" }`
 *
 * @param input Boolean, number, null, string, or plain object with or without `@id`.
 * @returns {FlattenNodeObjectReturnValue} A graph and a node reference.
 */
function flattenNodeObject(input: FlattenNodeObjectInput): FlattenNodeObjectReturnValue {
  assert(
    pipe(
      looseObject({}),
      check(value => !isNodeReference(value), 'Node reference cannot be flattened')
    ),
    input
  );

  const graph = new Map<Identifier, FlatNodeObject>();
  const refMap = new Map<object, NodeReference>();
  const output = flattenNodeObject_(input, graph, refMap);

  return { graph: Object.freeze(Array.from(graph.values())), output };
}

export default flattenNodeObject;
export { type FlattenNodeObjectInput, type FlattenNodeObjectReturnValue };
