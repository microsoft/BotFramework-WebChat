import {
  any,
  check,
  is,
  object,
  pipe,
  readonly,
  type BaseIssue,
  type BaseSchema,
  type ErrorMessage,
  type InferOutput,
  type ObjectIssue
} from 'valibot';

function refObject<TInput extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
  baseSchema: TInput
): BaseSchema<unknown, { get current(): InferOutput<TInput> }, BaseIssue<undefined>>;

function refObject<
  TInput extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<ObjectIssue> | undefined
>(
  baseSchema: TInput,
  message: TMessage
): BaseSchema<unknown, { get current(): InferOutput<TInput> }, BaseIssue<TMessage>>;

function refObject<
  TInput extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<ObjectIssue> | undefined
>(
  baseSchema: TInput,
  message?: TMessage
): BaseSchema<unknown, { get current(): InferOutput<TInput> }, BaseIssue<TMessage>> {
  return pipe(
    any(),
    check(value => is(pipe(object({ current: baseSchema }, message), readonly()), value))
  );
}

export default refObject;
