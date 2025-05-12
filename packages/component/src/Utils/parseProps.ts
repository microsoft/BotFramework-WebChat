import { parse, type BaseIssue, type BaseSchema, type InferOutput } from 'valibot';

export default function parseProps<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
  propsSchema: TSchema,
  props: unknown
): InferOutput<TSchema> {
  if (process.env.NODE_ENV === 'production') {
    return props as unknown as InferOutput<TSchema>;
  }

  try {
    return parse(propsSchema, props);
  } catch (error) {
    console.error(error.issues);

    throw error;
  }
}
