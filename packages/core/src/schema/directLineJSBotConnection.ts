import {
  custom,
  object,
  optional,
  safeParse,
  string,
  type CustomIssue,
  type CustomSchema,
  type ErrorMessage,
  type InferOutput
} from 'valibot';

import { type WebChatActivity } from '../types/WebChatActivity';
import observable, { type Observable } from './observable';
import customFunction from './private/customFunction';

const directLineJSBotConnectionSchema = object({
  activity$: observable<WebChatActivity>('activity$ must be an observable'),
  connectionStatus$: observable<number>('connectionStatus$ must be an observable'),
  end: optional(customFunction<() => void>('end must be a function')),
  getSessionId: optional(customFunction<() => Observable<string>>('getSessionId must be a function')),
  postActivity: customFunction<() => Observable<string>>('postActivity must be a function'),
  referenceGrammarId: optional(string('referenceGrammarId must be a string')),
  setUserId: optional(customFunction<(userId: string | undefined) => void>('setUserId must be a function'))
});

type DirectLineJSBotConnection = InferOutput<typeof directLineJSBotConnectionSchema>;

function directLineJSBotConnection(): CustomSchema<DirectLineJSBotConnection, undefined>;

function directLineJSBotConnection<
  const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined
>(message: TMessage): CustomSchema<DirectLineJSBotConnection, TMessage>;

function directLineJSBotConnection<
  const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined
>(message?: TMessage): CustomSchema<DirectLineJSBotConnection, TMessage> {
  return custom<DirectLineJSBotConnection, TMessage>(
    value => safeParse(directLineJSBotConnectionSchema, value).success,
    // TODO: Probably lacking some undefined checks, thus, we need to force cast.
    message as TMessage
  );
}

export default directLineJSBotConnection;
export { type DirectLineJSBotConnection };
