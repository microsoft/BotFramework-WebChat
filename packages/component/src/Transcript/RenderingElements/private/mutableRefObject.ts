import {
  any,
  check,
  object,
  pipe,
  safeParse,
  type BaseIssue,
  type BaseSchema,
  type ErrorMessage,
  type ObjectIssue,
  type ObjectSchema
} from 'valibot';

function mutableRefObject<TInput extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
  baseSchema: TInput
): ObjectSchema<{ current: TInput }, undefined>;

function mutableRefObject<
  TInput extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<ObjectIssue> | undefined
>(baseSchema: TInput, message: TMessage): ObjectSchema<{ current: TInput }, TMessage>;

function mutableRefObject<
  TInput extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<ObjectIssue> | undefined
>(baseSchema: TInput, message?: TMessage): BaseSchema<unknown, { current: TInput }, BaseIssue<unknown>> {
  return pipe(
    any(),
    check(value => safeParse(object({ current: baseSchema }, message), value).success)
  );
}

export default mutableRefObject;
