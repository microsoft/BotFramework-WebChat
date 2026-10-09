import type { ReadonlyDeep } from 'type-fest';
import {
  type BaseIssue,
  type BaseMetadata,
  type BaseSchema,
  type BaseSchemaAsync,
  type BaseTransformation,
  type BaseTransformationAsync,
  type BaseValidation,
  type BaseValidationAsync,
  type InferInput
} from 'valibot';

// Q: Why `InferInput` but not `InferOutput`?
// A: The component is going to take whatever the consumer send to us.
//    We might rectify (fill in the blank), but they aren't very strict until things get into our system.

// Q: Why not just `InferInput`?
// A: By default, `InferInput` don't mark things as read-only.
//    When parent component send props, those props could be read-only.
//    But the child component (wrongly) prefer read-write because `InferInput` ignore read-only.

type InferReactProps<
  TItem$1 extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
    | BaseValidation<any, unknown, BaseIssue<unknown>>
    | BaseValidationAsync<any, unknown, BaseIssue<unknown>>
    | BaseTransformation<any, unknown, BaseIssue<unknown>>
    | BaseTransformationAsync<any, unknown, BaseIssue<unknown>>
    | BaseMetadata<any>
> = ReadonlyDeep<InferInput<TItem$1>>;

export { type InferReactProps };
