import { type ForwardedRef } from 'react';
import { custom, nullable, safeParse, union, type CustomIssue, type CustomSchema, type ErrorMessage } from 'valibot';

import mutableRefObject from './mutableRefObject';
import refCallback from './refCallback';

const forwardedRefSchema = nullable(union([refCallback(), mutableRefObject()]));

function forwardedRef(): CustomSchema<ForwardedRef<any>, undefined>;
function forwardedRef<T>(): CustomSchema<ForwardedRef<T>, undefined>;

function forwardedRef<
  T,
  const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined
>(message: TMessage): CustomSchema<ForwardedRef<T>, TMessage>;

function forwardedRef<
  T,
  const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined
>(message?: TMessage): CustomSchema<ForwardedRef<T>, TMessage> {
  return custom<ForwardedRef<T>, TMessage>(
    value => safeParse(forwardedRefSchema, value).success,
    // TODO: Probably lacking some undefined checks, thus, we need to force cast.
    message as TMessage
  );
}

export default forwardedRef;
