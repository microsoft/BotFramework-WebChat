import {
  any,
  optional,
  pipe,
  readonly,
  safeParse,
  transform,
  type BaseIssue,
  type BaseSchema,
  type GenericSchema,
  type InferInput,
  type InferOutput
} from 'valibot';

const EMPTY_ARRAY = Object.freeze([]);

// JSON-LD property characteristics:
// - Every property value can be singular or plural (value)
// - Every property is optional

// Our interpretation of its characteristics:
// - Every property is an array
//    - This simplify our code, instead of `book.author[0] ?? book.author`, it will become `book.author[0]`
// - Optional property is an empty array
//    - This simplify our code, instead of `book.author?.[0]?.name?.[0]`, it will become `book.author[0]?.name[0]`
// - Invalid value is removed
//    - This simplify our code: validated input is key to simpler code
// - Unknown value is removed
//    - It is very difficult to keep unknown value
//    - If the unknown value is an object but not a JSON-LD object, we should not turn it into array
//    - Field such as @id should not be turned into array, maybe more rules in JSON-LD playbook

export default function jsonLinkedDataProperty<T extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
  schema: T
): GenericSchema<InferInput<T> | readonly InferInput<T>[] | undefined, readonly InferOutput<T>[]> {
  type TOutput = InferOutput<typeof schema>;

  return optional(
    pipe(
      // any() is okay, we will remove invalid value from the output array.
      any(),
      transform((value: TOutput | readonly TOutput[]): readonly TOutput[] => {
        if (typeof value === 'undefined') {
          return EMPTY_ARRAY;
        }

        let nextValue: readonly TOutput[];

        if (Array.isArray(value)) {
          nextValue = value;
        } else {
          nextValue = [value];
        }

        nextValue = nextValue.reduce<TOutput[]>((result, item) => {
          if (typeof item !== 'undefined') {
            const parseResult = safeParse(schema, item);

            parseResult.success && result.push(parseResult.output);
          }

          return result;
        }, []);

        return nextValue.length ? Object.freeze(nextValue) : EMPTY_ARRAY;
      }),
      readonly()
    ),
    EMPTY_ARRAY
  );
}
