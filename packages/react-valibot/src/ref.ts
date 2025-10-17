import { type Ref } from 'react';
import { custom, nullable, safeParse, union, type CustomIssue, type CustomSchema, type ErrorMessage } from 'valibot';

import refCallback from './refCallback';
import refObject from './refObject';

const refSchema = nullable(union([refCallback(), refObject()]));

function ref(): CustomSchema<Ref<any>, undefined>;
function ref<T>(): CustomSchema<Ref<T>, undefined>;

function ref<T, const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined>(
  message: TMessage
): CustomSchema<Ref<T>, TMessage>;

function ref<T, const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined>(
  message?: TMessage
): CustomSchema<Ref<T>, TMessage> {
  return custom<Ref<T>, TMessage>(
    value => safeParse(refSchema, value).success,
    // TODO: Probably lacking some undefined checks, thus, we need to force cast.
    message as TMessage
  );
}

export default ref;
