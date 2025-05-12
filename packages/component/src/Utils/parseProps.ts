import { parse, type BaseIssue, type BaseSchema, type InferOutput } from 'valibot';

export default function parseProps<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
  propsSchema: TSchema,
  props: unknown
): InferOutput<TSchema> {
  if (process.env.NODE_ENV === 'production') {
    return props as unknown as InferOutput<TSchema>;
  }

  // TODO: Default to `safeParse` unless the component is explicitly okay with strict, which clone the prop.
  try {
    return parse(propsSchema, props);
  } catch (error) {
    console.error('botframework-webchat: Error while parsing props.', error.issues);

    throw error;
  }
}
