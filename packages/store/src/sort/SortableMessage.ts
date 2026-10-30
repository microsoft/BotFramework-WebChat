import {
  integer,
  literal,
  minLength,
  minValue,
  number,
  object,
  optional,
  pipe,
  readonly,
  string,
  union,
  type InferInput,
  type InferOutput
} from 'valibot';
import { nodeSchema } from '../node/Node.ts';

/**
 * Sort facts of a message, extracted by the source (e.g. from a Direct Line activity) before the message enters the
 * graph. Extraction stays with the source: it knows the wire format, the sorter does not.
 */
const sortableMessageSchema = pipe(
  object({
    /** The message is a part of a HowTo grouping (schema.org `isPartOf`), at the position declared by the sender. */
    howTo: optional(
      pipe(
        object({
          groupingId: pipe(string(), minLength(1, 'groupingId must not be empty')),
          position: optional(number())
        }),
        readonly()
      )
    ),
    /** The message is a revision of a livestream session. */
    livestream: optional(
      union([
        pipe(
          object({
            final: literal(false),
            sequenceNumber: pipe(number(), integer(), minValue(1)),
            sessionId: pipe(string(), minLength(1, 'sessionId must not be empty'))
          }),
          readonly()
        ),
        pipe(
          object({
            final: literal(true),
            sessionId: pipe(string(), minLength(1, 'sessionId must not be empty'))
          }),
          readonly()
        )
      ])
    ),
    /** Fallback sort key in milliseconds, only compared between two messages without `logicalTimestamp`. */
    localTimestamp: optional(number()),
    /** Sort key: sequence ID if the source has one, otherwise the timestamp in milliseconds. */
    logicalTimestamp: optional(number()),
    /** The message node. Its `hasPart`, `isPartOf` and `position` are owned by the sorter and replaced. */
    node: nodeSchema
  }),
  readonly()
);

type SortableMessage = InferInput<typeof sortableMessageSchema>;
type SafeSortableMessage = InferOutput<typeof sortableMessageSchema>;

export { sortableMessageSchema, type SafeSortableMessage, type SortableMessage };
