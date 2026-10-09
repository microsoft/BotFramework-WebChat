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
