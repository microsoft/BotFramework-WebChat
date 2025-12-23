import { freeze } from '@msinternal/botframework-webchat-base/valibot';
import {
  array,
  includes,
  intersect,
  minLength,
  object,
  optional,
  picklist,
  pipe,
  string,
  tuple,
  type InferOutput
} from 'valibot';

import { DirectLineActivityNodeSchema } from './DirectLineActivityNode';

const MessageNodeSchema = pipe(
  intersect([
    // TODO: [P*] Not sure why if SlantNode is intersected, the object become frozen and cannot assign @id.
    //       Related to /html/fluentTheme/maxMessageLength.html.
    // SlantNodeSchema,
    DirectLineActivityNodeSchema,
    object({
      '@type': pipe(array(string()), minLength(1), includes('Message')),
      encodingFormat: tuple([picklist(['text/markdown', 'text/plain'])]),
      text: optional(tuple([string()]))
    })
  ]),
  freeze()
);

type MessageNode = InferOutput<typeof MessageNodeSchema>;

export { MessageNodeSchema, type MessageNode };
