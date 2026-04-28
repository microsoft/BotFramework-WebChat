import { lazy, object, parse, string, type GenericSchema } from 'valibot';

import { actionSchema, type ActionInput, type ActionOutput } from './Action';
import jsonLinkedDataProperty from './private/jsonLinkedDataProperty';
import { jsonLinkedDataEntries, type JSONLinkedDataInput, type JSONLinkedDataOutput } from './JSONLinkedData';

/**
 * The most generic type of item.
 *
 * This is partial implementation of https://schema.org/Thing.
 *
 * @see https://schema.org/Thing
 */
type ThingInput = JSONLinkedDataInput & {
  /**
   * An additional type for the item, typically used for adding more specific types from external vocabularies in microdata syntax. This is a relationship between something and a class that the thing is in. Typically the value is a URI-identified RDF class, and in this case corresponds to the use of rdf:type in RDF. Text values can be used sparingly, for cases where useful information can be added without their being an appropriate schema to reference. In the case of text values, the class label should follow the schema.org [style guide](https://schema.org/docs/styleguide.html).
   *
   * @see https://schema.org/additionalType
   */
  readonly additionalType?: string | readonly string[] | undefined;

  /**
   * An alias for the item.
   *
   * @see https://schema.org/alternateName
   */
  readonly alternateName?: string | readonly string[] | undefined;

  /**
   * A description of the item.
   *
   * @see https://schema.org/description
   */
  readonly description?: string | readonly string[] | undefined;

  /**
   * The name of the item.
   *
   * @see https://schema.org/name
   */
  readonly name?: string | readonly string[] | undefined;

  /**
   * Indicates a potential Action, which describes an idealized action in which this thing would play an 'object' role.
   *
   * @see https://schema.org/potentialAction
   */
  readonly potentialAction?: ActionInput | readonly ActionInput[] | undefined;

  /**
   * URL of the item.
   *
   * @see https://schema.org/url
   */
  readonly url?: string | readonly string[] | undefined;
};

/**
 * The most generic type of item.
 *
 * This is partial implementation of https://schema.org/Thing.
 *
 * @see https://schema.org/Thing
 */
type ThingOutput = JSONLinkedDataOutput & {
  /**
   * An additional type for the item, typically used for adding more specific types from external vocabularies in microdata syntax. This is a relationship between something and a class that the thing is in. Typically the value is a URI-identified RDF class, and in this case corresponds to the use of rdf:type in RDF. Text values can be used sparingly, for cases where useful information can be added without their being an appropriate schema to reference. In the case of text values, the class label should follow the schema.org [style guide](https://schema.org/docs/styleguide.html).
   *
   * @see https://schema.org/additionalType
   */
  readonly additionalType: readonly string[];

  /**
   * An alias for the item.
   *
   * @see https://schema.org/alternateName
   */
  readonly alternateName: readonly string[];

  /**
   * A description of the item.
   *
   * @see https://schema.org/description
   */
  readonly description: readonly string[];

  /**
   * The name of the item.
   *
   * @see https://schema.org/name
   */
  readonly name: readonly string[];

  /**
   * Indicates a potential Action, which describes an idealized action in which this thing would play an 'object' role.
   *
   * @see https://schema.org/potentialAction
   */
  readonly potentialAction: readonly ActionOutput[];

  /**
   * URL of the item.
   *
   * @see https://schema.org/url
   */
  readonly url: readonly string[];
};

const thingEntries = {
  ...jsonLinkedDataEntries,
  additionalType: jsonLinkedDataProperty(string()),
  alternateName: jsonLinkedDataProperty(string()),
  description: jsonLinkedDataProperty(string()),
  name: jsonLinkedDataProperty(string()),
  potentialAction: jsonLinkedDataProperty(lazy(() => actionSchema)),
  url: jsonLinkedDataProperty(string())
};

const thingSchema: GenericSchema<ThingInput, ThingOutput> = object(thingEntries);

/** @deprecated Use Valibot.parse(thingSchema) instead. Will be removed on or after 2028-04-23. */
const parseThing = (thing: ThingInput): ThingOutput => parse(thingSchema, thing);

export { parseThing, thingEntries, thingSchema, type ThingInput, type ThingOutput };
