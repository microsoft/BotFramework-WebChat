import { type ReactNode } from 'react';
import { custom, type CustomIssue, type CustomSchema, type ErrorMessage } from 'valibot';

function reactNode(): CustomSchema<ReactNode, undefined>;

function reactNode<
  const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined
>(message: TMessage): CustomSchema<ReactNode, TMessage>;

function reactNode<
  const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined
>(message?: TMessage): CustomSchema<ReactNode, TMessage> {
  return custom<ReactNode, TMessage>(
    () => true,
    // TODO: Probably lacking some undefined checks, thus, we need to force cast.
    message as TMessage
  );
}

export default reactNode;
