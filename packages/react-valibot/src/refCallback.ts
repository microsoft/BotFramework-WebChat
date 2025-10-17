import { type RefCallback } from 'react';
import { custom, safeParse, type CustomIssue, type CustomSchema, type ErrorMessage } from 'valibot';

const refCallbackSchema = custom<(current: any) => void>(value => typeof value === 'function');

function refCallback(): CustomSchema<RefCallback<any>, undefined>;
function refCallback<T>(): CustomSchema<RefCallback<T>, undefined>;

function refCallback<
  T,
  const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined
>(message: TMessage): CustomSchema<RefCallback<T>, TMessage>;

function refCallback<
  T,
  const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined
>(message?: TMessage): CustomSchema<RefCallback<T>, TMessage> {
  return custom<RefCallback<T>, TMessage>(
    value => safeParse(refCallbackSchema, value).success,
    // TODO: Probably lacking some undefined checks, thus, we need to force cast.
    message as TMessage
  );
}

export default refCallback;
