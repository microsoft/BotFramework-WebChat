import {
  array,
  includes,
  intersect,
  minLength,
  number,
  object,
  optional,
  picklist,
  pipe,
  startsWith,
  string,
  tuple,
  union,
  type InferOutput
} from 'valibot';
import { SlantNodeSchema } from './colorNode';
import { IdentifierSchema } from './Identifier';
import { JSONLiteralSchema } from './JSONLiteral';
import { NodeReferenceSchema } from './NodeReference';
import freeze from './private/freeze';

// TODO: [P*] When nodes are added to graph, check against this schema if it has @type of "Message".
const MessageNodeSchema = pipe(
  intersect([
    SlantNodeSchema,
    object({
      '@type': pipe(array(string()), minLength(1), includes('Message')),
      encodingFormat: tuple([picklist(['text/markdown', 'text/plain'])]),
      identifier: array(
        union([
          pipe(IdentifierSchema, startsWith('urn:microsoft:webchat:client-activity-id:')),
          pipe(IdentifierSchema, startsWith('urn:microsoft:webchat:direct-line-activity:id:'))
        ])
      ),
      position: tuple([number()]),
      sender: tuple([NodeReferenceSchema]),
      text: optional(tuple([string()])),
      'urn:microsoft:webchat:direct-line-activity:raw-json': tuple([JSONLiteralSchema])
    })
  ]),
  freeze()
);

type MessageNode = InferOutput<typeof MessageNodeSchema>;

export { MessageNodeSchema, type MessageNode };
