import { type DirectLineJSBotConnection } from 'botframework-webchat-core';
import { type InferOutput, custom, object, pipe, string, undefinedable } from 'valibot';

const connectionDetailsSchema = pipe(
  object({
    directLine: custom<DirectLineJSBotConnection>(() => true),
    userId: undefinedable(string()),
    username: undefinedable(string())
  })
);

type ConnectionDetails = InferOutput<typeof connectionDetailsSchema>;

export { connectionDetailsSchema, type ConnectionDetails };
