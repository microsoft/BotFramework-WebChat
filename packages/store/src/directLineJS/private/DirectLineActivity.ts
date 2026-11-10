import {
  array,
  number,
  objectWithRest,
  optional,
  parse,
  picklist,
  pipe,
  readonly,
  string,
  type InferOutput
} from 'valibot';
import { jsonValueSchema } from '../../node/JSONValue.ts';

// Fields known used in Web Chat, they should not be `null`, but `undefined`. The only field omitted is "value", as it
// could be `null` purposefully.
const NULLABLE_FIELD_NAMES: ReadonlySet<string> = new Set([
  'attachmentLayout',
  'attachments',
  'channelData',
  'conversation',
  'entities',
  'from',
  'inputHint',
  'locale',
  'name',
  'recipient',
  'replyToId',
  'speak',
  'suggestedActions',
  'text',
  'textFormat',
  'timestamp',
  'type'
]);

/**
 * Schema of Direct Line activity, only fields used by the store are validated.
 *
 * Other fields are kept as JSON values, i.e. same as `JSON.parse(JSON.stringify(value))`, as the activity is what was
 * sent over the wire.
 */
const directLineActivitySchema = pipe(
  objectWithRest(
    {
      channelData: optional(
        objectWithRest(
          {
            clientActivityID: optional(string('"channelData.clientActivityID" must be a string')),
            'webchat:sequence-id': optional(number('"channelData[\'webchat:sequence-id\']" must be a number'))
          },
          jsonValueSchema
        )
      ),
      entities: optional(array(jsonValueSchema, '"entities" must be an array')),
      from: objectWithRest(
        {
          id: optional(string('"from.id" must be a string')),
          role: picklist(['bot', 'channel', 'user'], '"from.role" must be "bot", "channel", or "user"')
        },
        jsonValueSchema
      ),
      id: optional(string('"id" must be a string')),
      localTimestamp: optional(string('"localTimestamp" must be a string')),
      replyToId: optional(string('"replyToId" must be a string')),
      text: optional(string('"text" must be a string')),
      textFormat: optional(string('"textFormat" must be a string')),
      timestamp: optional(string('"timestamp" must be a string')),
      type: string('"type" must be a string')
    },
    jsonValueSchema
  ),
  readonly()
);

type DirectLineActivity = InferOutput<typeof directLineActivitySchema>;

function isObject(value: unknown): value is object {
  return !!value && typeof value === 'object';
}

/**
 * Normalizes and validates an activity received from Direct Line, the input is never modified.
 *
 * - `null` in known fields are removed
 * - `from.role` is patched to `"bot"`, `"channel"`, or `"user"` if not set, see `patchActivityWithFromRole()` in
 *   `observeActivitySaga.ts` of `botframework-webchat-core`
 *
 * @throws Throws if the activity is invalid.
 */
function parseDirectLineActivity(value: unknown, userId: string | undefined): DirectLineActivity {
  if (!isObject(value)) {
    throw new TypeError('Activity must be an object');
  }

  const activity: Record<string, unknown> = Object.fromEntries(
    Object.entries(value).filter(([key, fieldValue]) => !(fieldValue === null && NULLABLE_FIELD_NAMES.has(key)))
  );

  const from = isObject(activity['from']) ? activity['from'] : {};
  const fromId: unknown = Reflect.get(from, 'id');

  activity['from'] = {
    ...from,
    role:
      Reflect.get(from, 'role') ||
      (typeof fromId === 'string' && fromId ? (fromId === userId ? 'user' : 'bot') : 'channel')
  };

  return parse(directLineActivitySchema, activity);
}

export { directLineActivitySchema, parseDirectLineActivity, type DirectLineActivity };
