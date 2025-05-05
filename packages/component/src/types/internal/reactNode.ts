import { type ReactNode } from 'react';
import { custom, type CustomIssue, type CustomSchema, type ErrorMessage } from 'valibot';

function reactNode(): CustomSchema<ReactNode, undefined>;

function reactNode<
  const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined
>(message: TMessage): CustomSchema<ReactNode, TMessage>;

function reactNode<
  const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined
>(message?: TMessage): CustomSchema<ReactNode, TMessage> {
  return custom<ReactNode, TMessage>(() => true, message);
}

export default reactNode;
