import { type EmptyObject } from 'type-fest';
import { lazy, literal, looseObject, optional, parse, pipe, string, union, type ObjectEntries } from 'valibot';

import { action, type Action } from './Action';
import orgSchemaProperties from './private/orgSchemaProperties';
import orgSchemaProperty from './private/orgSchemaProperty';
import type OneOrMany from '../../OneOrMany';
import { creativeWork, type CreativeWork } from './CreativeWork';

/**
 * The most generic type of item.
 *
 * This is partial implementation of https://schema.org/Thing.
 *
 * @see https://schema.org/Thing
 */
export type Thing = {
  '@context'?: 'https://schema.org' | undefined;
  '@id'?: string | undefined;
  '@type': string;

  /**
   * An additional type for the item, typically used for adding more specific types from external vocabularies in microdata syntax. This is a relationship between something and a class that the thing is in. Typically the value is a URI-identified RDF class, and in this case corresponds to the use of rdf:type in RDF. Text values can be used sparingly, for cases where useful information can be added without their being an appropriate schema to reference. In the case of text values, the class label should follow the schema.org [style guide](https://schema.org/docs/styleguide.html).
   *
   * @see https://schema.org/additionalType
   */
  additionalType?: string | undefined;

  /**
   * An alias for the item.
   *
   * @see https://schema.org/alternateName
   */
  alternateName?: string | undefined;

  /**
   * A description of the item.
   *
   * @see https://schema.org/description
   */
  description?: string | undefined;

  /**
   * The name of the item.
   *
   * @see https://schema.org/name
   */
  name?: string | undefined;

  /**
   * Indicates a potential Action, which describes an idealized action in which this thing would play an 'object' role.
   *
   * @see https://schema.org/potentialAction
   */
  potentialAction?: readonly Action[] | undefined;

  /**
   * URL of the item.
   *
   * @see https://schema.org/url
   */
  url?: string | undefined;

  /**
   * Indicates an item or CreativeWork that this item, or CreativeWork (in some sense), is part of.
   *
   * @see https://schema.org/isPartOf
   */
  isPartOf?: OneOrMany<CreativeWork> | undefined;
};

const thingEntries = {
  '@context': optional(pipe(string(), literal('https://schema.org'))),
  '@id': optional(string()),
  '@type': string(),

  additionalType: orgSchemaProperty(string()),
  alternateName: orgSchemaProperty(string()),
  description: orgSchemaProperty(string()),
  name: orgSchemaProperty(string()),
  potentialAction: orgSchemaProperties(lazy(() => action())),
  url: orgSchemaProperty(string()),
  isPartOf: orgSchemaProperties(lazy(() => creativeWork()))
};

export const thing = <TEntries extends ObjectEntries>(entries?: TEntries | undefined) =>
  // Forward compatibility is the reason why we use unknown() here and not adhere to JSON-LD which drop unknown fields.
  //
  // Example:
  // - CreativeWork.editor must be type of Person (or any of its subtypes, Patient)
  // - Without unknown(), when we parse the CreativeWork, we will drop Patient.diagnosis
  // - That means, CreativeWork.editor.diagnosis will be unset despite CreativeWork.editor is of type Patient
  //
  // We can drop unknown() if there is a way to keep CreativeWork.editor.diagnosis.
  // It is okay to drop future/unsupported properties. But not today/supported properties.
  looseObject({
    ...thingEntries,
    ...entries
  });

export const parseThing = (data: unknown): Thing => parse(thing<EmptyObject>(), data);
