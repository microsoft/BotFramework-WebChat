import {
  array,
  instance,
  literal,
  object,
  parse,
  picklist,
  pipe,
  readonly,
  type BaseIssue,
  type BaseSchema,
  type InferOutput
} from 'valibot';

// No dangerous value such as: constructor, prototype, etc.
const allowedSuffixSchema = picklist(['FULFILLED', 'IMPEDED', 'PENDING']);

type AllowedSuffix = InferOutput<typeof allowedSuffixSchema>;

const suffixesSchema = array(allowedSuffixSchema);

export default function createMiddlewareActionSchemas<
  const TName extends string,
  const TPayloadSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TMetaSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TSuffix extends AllowedSuffix
>(prefix: TName, suffixes: readonly TSuffix[], payloadSchema: TPayloadSchema, metaSchema: TMetaSchema) {
  const result: {
    [K in TSuffix]: Readonly<{
      name: `${TName}_${K}`;
      schema: BaseSchema<
        unknown,
        {
          meta: InferOutput<typeof metaSchema>;
          payload: InferOutput<typeof payloadSchema>;
          type: `${TName}_${K}`;
        },
        BaseIssue<unknown>
      >;
    }>;
  } = {} as any;

  for (const suffix of parse(suffixesSchema, suffixes)) {
    // We use allowlist to filter the suffix.
    // eslint-disable-next-line security/detect-object-injection
    result[suffix] = {
      name: `${prefix}_${suffix}` as const,
      schema: pipe(
        object({
          meta: metaSchema,
          payload: payloadSchema,
          type: literal(`${prefix}_${suffix}`)
        }),
        readonly()
      )
    };
  }

  return Object.freeze({
    ...result,
    REJECTED: {
      name: `${prefix}_REJECTED` as const,
      schema: pipe(
        object({
          error: literal(true),
          meta: metaSchema,
          payload: instance(Error),
          type: literal(`${prefix}_REJECTED`)
        }),
        readonly()
      )
    }
  });
}
