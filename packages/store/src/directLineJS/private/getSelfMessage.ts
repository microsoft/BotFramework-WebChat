import {
  array,
  is,
  literal,
  looseObject,
  number,
  optional,
  pipe,
  safeParse,
  startsWith,
  string,
  union,
  unknown,
  type InferOutput
} from 'valibot';

function toArray<T>(value: T | readonly T[] | undefined): readonly T[] {
  return typeof value === 'undefined' ? [] : Array.isArray(value) ? value : [value as T];
}

const possiblySelfMessageSchema = looseObject({
  '@id': literal(''),
  type: pipe(string(), startsWith('https://schema.org/'))
});

const partSchema = looseObject({
  '@id': optional(string()),
  '@type': optional(union([string(), array(string())]))
});

const positionSchema = union([number(), string()]);

const selfMessageSchema = looseObject({
  abstract: optional(unknown()),
  isPartOf: optional(union([partSchema, array(partSchema)])),
  position: optional(union([positionSchema, array(positionSchema)]))
});

type SelfMessage = {
  readonly abstract: readonly unknown[];
  readonly isPartOf: readonly {
    readonly '@id'?: string | undefined;
    readonly '@type': readonly string[];
  }[];
  readonly position: readonly (number | string)[];
};

/**
 * Gets the Schema.org entity which describe the activity itself, i.e. `@id` is `""`, see `getOrgSchemaMessage()` of
 * `botframework-webchat-core`.
 *
 * Only properties used by the store are returned, plural properties are always arrays.
 */
function getSelfMessage(entities: readonly unknown[] | undefined): SelfMessage | undefined {
  const entity = entities?.find(entity => is(possiblySelfMessageSchema, entity));

  if (!entity) {
    return undefined;
  }

  const result = safeParse(selfMessageSchema, entity);

  if (!result.success) {
    return undefined;
  }

  const { abstract, isPartOf, position } = result.output;

  return Object.freeze({
    abstract: Object.freeze(toArray(abstract)),
    isPartOf: Object.freeze(
      toArray<InferOutput<typeof partSchema>>(isPartOf).map(part =>
        Object.freeze({ '@id': part['@id'], '@type': Object.freeze(toArray(part['@type'])) })
      )
    ),
    position: Object.freeze(toArray(position))
  });
}

export default getSelfMessage;
export { type SelfMessage };
