import { custom, function_, object, safeParse, type CustomIssue, type CustomSchema, type ErrorMessage } from 'valibot';

import { type Observable } from '../types/external/Observable';

const observableSchema = object({ subscribe: function_() });

function observable(): CustomSchema<Observable<any>, undefined>;

function observable<T>(): CustomSchema<Observable<T>, undefined>;

function observable<
  T,
  const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined
>(message: TMessage): CustomSchema<Observable<T>, TMessage>;

function observable<
  T,
  const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined
>(message?: TMessage): CustomSchema<Observable<T>, TMessage> {
  return custom<Observable<T>, TMessage>(
    value => safeParse(observableSchema, value).success,
    // TODO: Probably lacking some undefined checks, thus, we need to force cast.
    message as TMessage
  );
}

export default observable;
export { type Observable };
