import {
  array,
  includes,
  intersect,
  minLength, object,
  optional,
  picklist,
  pipe,
  string,
  tuple,
  type InferOutput
} from 'valibot';
import { SlantNodeSchema } from './colorNode';
import { DirectLineActivityNodeSchema } from './DirectLineActivityNode';
import freeze from './private/freeze';

// TODO: [P*] When nodes are added to graph, check against this schema if it has @type of "Message".
const MessageNodeSchema = pipe(
  intersect([
    SlantNodeSchema,
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
