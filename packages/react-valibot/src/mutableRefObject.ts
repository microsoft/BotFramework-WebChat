import { type RefObject } from 'react';
import { any, custom, object, safeParse, type CustomIssue, type CustomSchema, type ErrorMessage } from 'valibot';

const mutableRefObjectSchema = object({ current: any() });

function mutableRefObject(): CustomSchema<RefObject<any>, undefined>;
function mutableRefObject<T>(): CustomSchema<RefObject<T>, undefined>;

function mutableRefObject<
  T,
  const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined
>(message: TMessage): CustomSchema<RefObject<T>, TMessage>;

function mutableRefObject<
  T,
  const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined
>(message?: TMessage): CustomSchema<RefObject<T>, TMessage> {
  return custom<RefObject<T>, TMessage>(
    value => safeParse(mutableRefObjectSchema, value).success,
    // TODO: Probably lacking some undefined checks, thus, we need to force cast.
    message as TMessage
  );
}

export default mutableRefObject;
