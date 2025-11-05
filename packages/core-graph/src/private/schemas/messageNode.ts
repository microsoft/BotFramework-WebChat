import {
  array,
  includes,
  intersect,
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
import { slantNode } from './colorNode';
import identifier from './Identifier';
import { jsonLiteral } from './jsonLiteral';
import { nodeReference } from './NodeReference';
import freeze from './private/freeze';

// TODO: [P*] When nodes are added to graph, check against this schema if it has @type of "Message".
function messageNode() {
  return pipe(
    intersect([
      slantNode(),
      object({
        '@type': pipe(array(string()), includes('Message')),
        encodingFormat: tuple([picklist(['text/markdown', 'text/plain'])]),
        identifier: array(
          union([
            pipe(identifier(), startsWith('urn:microsoft:webchat:client-activity-id:')),
            pipe(identifier(), startsWith('urn:microsoft:webchat:direct-line-activity:id:'))
          ])
        ),
        position: tuple([number()]),
        sender: tuple([nodeReference()]),
        text: optional(tuple([string()])),
        'urn:microsoft:webchat:direct-line-activity:raw-json': tuple([jsonLiteral()])
      })
    ]),
    freeze()
  );
}

type MessageNode = InferOutput<ReturnType<typeof messageNode>>;

export default messageNode;
export { type MessageNode };
