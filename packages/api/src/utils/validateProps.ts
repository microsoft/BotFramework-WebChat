import { parse, safeParse, type BaseIssue, type BaseSchema, type InferInput, type InferOutput } from 'valibot';

/**
 * Specifies the props isolation mode.
 *
 * - `"no isolation"` will return the props as-is without cloning or modifications
 * - `"strict"` will isolate the props using `valibot.parse()`
 *    - Depends on schema design, it could clone object instances, remove extraneous properties from objects, or fill in optional fields
 */
type IsolationMode = 'no isolation' | 'strict';

export default function validateProps<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
  propsSchema: TSchema,
  props: unknown,
  isolationMode?: 'no isolation' | undefined
): InferInput<TSchema>;

export default function validateProps<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
  propsSchema: TSchema,
  props: unknown,
  isolationMode?: 'strict'
): InferOutput<TSchema>;

/**
 * Validates props against the specified valibot schema when running under development mode.
 *
 * This function will not perform any validations when running under production mode.
 *
 * @param propsSchema validation schema
 * @param props props to validate
 * @param mode specifies the isolation mode, default to `"no isolation"`
 * @returns
 */
export default function validateProps<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
  propsSchema: TSchema,
  props: InferInput<TSchema>,
  isolationMode?: IsolationMode | undefined
): InferInput<TSchema> | InferOutput<TSchema> {
  if (process.env.NODE_ENV === 'production') {
    return props as unknown as InferInput<TSchema>;
  }

  if (isolationMode !== 'strict' && safeParse(propsSchema, props).success) {
    return props as unknown as InferInput<TSchema>;
  }

  // Code path hit here when under strict isolation, or no isolation and failed earlier.

  try {
    return parse(propsSchema, props);
  } catch (error) {
    console.error('botframework-webchat: Validation error while parsing props.', error.issues);

    throw error;
  }
}
