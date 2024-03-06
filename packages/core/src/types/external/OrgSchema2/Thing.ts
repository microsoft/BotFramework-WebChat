import { type EmptyObject } from 'type-fest';
import {
  object,
  optional,
  parse,
  string,
  unknown,
  value,
  type ObjectEntries,
  type Output,
  type StringSchema
} from 'valibot';

import orgSchemaProperty from './private/orgSchemaProperty';

const thingEntries = {
  '@context': optional(string([value('https://schema.org')]) as StringSchema<'https://schema.org'>),
  '@id': optional(string()),
  '@type': string(),

  /** An additional type for the item, typically used for adding more specific types from external vocabularies in microdata syntax. This is a relationship between something and a class that the thing is in. Typically the value is a URI-identified RDF class, and in this case corresponds to the use of rdf:type in RDF. Text values can be used sparingly, for cases where useful information can be added without their being an appropriate schema to reference. In the case of text values, the class label should follow the schema.org [style guide](https://schema.org/docs/styleguide.html). */
  additionalType: orgSchemaProperty(string()),

  /** An alias for the item. */
  alternateName: orgSchemaProperty(string()),

  /** A description of the item. */
  description: orgSchemaProperty(string()),

  /** The name of the item. */
  name: orgSchemaProperty(string()),

  /** URL of the item. */
  url: orgSchemaProperty(string())
};

export const thing = <TEntries extends ObjectEntries>(entries?: TEntries | undefined) =>
  object(
    {
      ...thingEntries,
      ...entries
    },
    unknown()
  );

/**
 * The most generic type of item.
 *
 * This is partial implementation of https://schema.org/Thing.
 *
 * @see https://schema.org/Thing
 */
export type Thing = Output<ReturnType<typeof object<typeof thingEntries>>>;

export const parseThing = (data: unknown): Thing => parse(thing<EmptyObject>(), data);
