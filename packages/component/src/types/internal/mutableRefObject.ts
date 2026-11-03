import { type MutableRefObject } from 'react';
import {
  any,
  check,
  is,
  object,
  pipe,
  type BaseIssue,
  type BaseSchema,
  type ErrorMessage,
  type InferOutput,
  type ObjectIssue
} from 'valibot';

function mutableRefObject<TInput extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
  baseSchema: TInput
): BaseSchema<MutableRefObject<InferOutput<TInput>>, MutableRefObject<InferOutput<TInput>>, BaseIssue<undefined>>;

function mutableRefObject<
  TInput extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<ObjectIssue> | undefined
>(
  baseSchema: TInput,
  message: TMessage
): BaseSchema<MutableRefObject<InferOutput<TInput>>, MutableRefObject<InferOutput<TInput>>, BaseIssue<TMessage>>;

function mutableRefObject<
  TInput extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<ObjectIssue> | undefined
>(
  baseSchema: TInput,
  message?: TMessage
): BaseSchema<MutableRefObject<InferOutput<TInput>>, MutableRefObject<InferOutput<TInput>>, BaseIssue<TMessage>> {
  return pipe(
    any(),
    check(value => is(object({ current: baseSchema }, message), value))
  );
}

export default mutableRefObject;
