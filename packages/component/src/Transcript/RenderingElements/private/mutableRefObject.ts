import {
  object,
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
>(baseSchema: TInput, message?: TMessage): ObjectSchema<{ current: TInput }, TMessage> {
  return object({ current: baseSchema }, message);
}

export default mutableRefObject;
