import { type RefObject } from 'react';
import {
  any,
  custom,
  object,
  pipe,
  readonly,
  safeParse,
  type CustomIssue,
  type CustomSchema,
  type ErrorMessage
} from 'valibot';

const refObjectSchema = pipe(object({ current: any() }), readonly());

function refObject(): CustomSchema<RefObject<any>, undefined>;
function refObject<T>(): CustomSchema<RefObject<T>, undefined>;

function refObject<
  T,
  const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined
>(message: TMessage): CustomSchema<RefObject<T>, TMessage>;

function refObject<
  T,
  const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined
>(message?: TMessage): CustomSchema<RefObject<T>, TMessage> {
  return custom<RefObject<T>, TMessage>(
    value => safeParse(refObjectSchema, value).success,
    // TODO: Probably lacking some undefined checks, thus, we need to force cast.
    message as TMessage
  );
}

export default refObject;
