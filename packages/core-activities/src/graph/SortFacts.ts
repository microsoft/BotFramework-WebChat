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
  type InferOutput
} from 'valibot';

/**
 * Sort facts of an activity, extracted from it before it enters the graph (`toSortFacts()`).
 */
const sortFactsSchema = pipe(
  object({
    /** The activity is a part of a HowTo grouping (schema.org `isPartOf`), at the position declared by the sender. */
    howTo: optional(
      pipe(
        object({
          groupingId: pipe(string(), minLength(1, 'groupingId must not be empty')),
          position: optional(number())
        }),
        readonly()
      )
    ),
    /** The activity is a revision of a livestream session. */
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
    logicalTimestamp: optional(number())
  }),
  readonly()
);

type SortFacts = InferOutput<typeof sortFactsSchema>;

export { sortFactsSchema, type SortFacts };
