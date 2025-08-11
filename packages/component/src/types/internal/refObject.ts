import {
  any,
  check,
  object,
  pipe,
  readonly,
  safeParse,
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
    check(value => safeParse(pipe(object({ current: baseSchema }, message), readonly()), value).success)
  );
}

export default refObject;
