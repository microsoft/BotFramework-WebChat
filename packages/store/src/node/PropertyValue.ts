import { is, pipe, rawTransform, readonly, safeParse, unknown, type GenericSchema, type InferOutput } from 'valibot';
import { type JSONLiteral } from './JSONLiteral.ts';
import { jsonValueSchema } from './JSONValue.ts';
import { identifierSchema } from './NodeIdentifier.ts';
import { type nodeReferenceSchema } from './NodeReference.ts';

type PropertyValueItem = boolean | number | string | InferOutput<typeof nodeReferenceSchema> | JSONLiteral;
type PropertyValue = readonly PropertyValueItem[];

const ITEM_MESSAGE = 'Property value must be array of boolean, number, string, node reference, or JSON literal';

/** Checks if the object has no keys other than the specified, mirrors `strictObject()` which uses `for...in`. */
function hasOnlyKeys(value: object, keys: readonly string[]): boolean {
  for (const key in value) {
    if (!keys.includes(key)) {
      return false;
    }
  }

  return true;
}

/** Returned by `convertItem()` when the item is invalid, issues are already added. */
const INVALID: unique symbol = Symbol('webchat-invalid');

/** Validates and converts an item of property value, calls `addIssue()` with the messages if it is invalid. */
function convertItem(item: unknown, addIssue: (message: string) => void): PropertyValueItem | typeof INVALID {
  if (typeof item === 'boolean' || typeof item === 'string' || (typeof item === 'number' && !Number.isNaN(item))) {
    return item;
  } else if (item && typeof item === 'object') {
    if ('@id' in item && hasOnlyKeys(item, ['@id'])) {
      const id = item['@id'];

      if (is(identifierSchema, id)) {
        return { '@id': id };
      }
    } else if (
      '@type' in item &&
      item['@type'] === '@json' &&
      '@value' in item &&
      hasOnlyKeys(item, ['@type', '@value'])
    ) {
      const result = safeParse(jsonValueSchema, item['@value']);

      if (result.success) {
        return { '@type': '@json', '@value': result.output };
      }

      result.issues.forEach(({ message }) => addIssue(message));

      return INVALID;
    }
  }

  addIssue(ITEM_MESSAGE);

  return INVALID;
}

/**
 * Schema of property value, a non-empty array of boolean, number (except `NaN`), string, node reference, or JSON literal.
 *
 * Node references and JSON literals are copied, `@value` of JSON literal is converted by `jsonValueSchema`.
 *
 * Same as `array(union([nodeReferenceSchema, boolean(), number(), string(), jsonLiteralSchema]))` with `minLength(1)`,
 * but validated and converted in a single pass. `union()` build issues for every failed option, which is ~10-70x slower.
 */
const propertyValueSchema: GenericSchema<unknown, PropertyValue> = pipe(
  unknown(),
  rawTransform(({ addIssue, dataset: { value }, NEVER }) => {
    if (!Array.isArray(value)) {
      addIssue({ message: ITEM_MESSAGE });

      return NEVER;
    } else if (!value.length) {
      addIssue({ message: 'Property must have at least one value' });

      return NEVER;
    }

    const output: PropertyValueItem[] = [];
    let valid = true;

    for (const item of value) {
      const result = convertItem(item, message => addIssue({ message }));

      result === INVALID ? (valid = false) : output.push(result);
    }

    return valid ? output : NEVER;
  }),
  readonly()
);

export { propertyValueSchema, type PropertyValue };
