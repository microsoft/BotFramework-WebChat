import {
  array,
  includes,
  is,
  number,
  object,
  optional,
  picklist,
  pipe,
  readonly,
  string,
  tuple,
  type InferOutput
} from 'valibot';
import { IdentifierSchema } from './Identifier';
import { JSONLiteralSchema } from './JSONLiteral';
import { NodeReferenceSchema } from './NodeReference';

// TODO: [P1] Maybe we should not always need readonly() but only add it as needed.
const DirectLineActivityNodeSchema = pipe(
  object({
    '@id': IdentifierSchema,
    '@type': pipe(array(string()), includes('urn:microsoft:webchat:direct-line-activity')),
    // TODO: [P*] Checks why tdentifier could be undefined.
    //       Related to /html2/accessibility/suggestedActions/stackedLayout.ariaAttributes.html.
    identifier: optional(array(IdentifierSchema)),
    position: tuple([number()]),
    // TODO: [P*] Remove optional(), every activity should have sender.
    sender: optional(tuple([NodeReferenceSchema])),
    'urn:microsoft:webchat:direct-line-activity:raw-json': tuple([JSONLiteralSchema]),
    'urn:microsoft:webchat:direct-line-activity:type': tuple([picklist(['event', 'message', 'typing'])])
  }),
  readonly()
);

const isOfTypeDirectLineActivity = is.bind(undefined, DirectLineActivityNodeSchema);

type DirectLineActivityNode = InferOutput<typeof DirectLineActivityNodeSchema>;

export { DirectLineActivityNodeSchema, isOfTypeDirectLineActivity, type DirectLineActivityNode };
