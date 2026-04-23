import { lazy, literal, looseObject, optional, pipe, readonly, string, type GenericSchema } from 'valibot';

import orgSchemaProperties from './private/orgSchemaProperties';
import { actionSchema, type ActionInput, type ActionOutput } from './Action';

/**
 * The most generic type of item.
 *
 * This is partial implementation of https://schema.org/Thing.
 *
 * @see https://schema.org/Thing
 */
type ThingInput = {
  readonly '@context'?: 'https://schema.org' | undefined;
  readonly '@id'?: string | undefined;
  readonly '@type'?: string | undefined;

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

  /**
   * Indicates an item or CreativeWork that this item, or CreativeWork (in some sense), is part of.
   *
   * @see https://schema.org/isPartOf
   */
  readonly isPartOf?: ThingInput | readonly ThingInput[] | undefined;
};

/**
 * The most generic type of item.
 *
 * This is partial implementation of https://schema.org/Thing.
 *
 * @see https://schema.org/Thing
 */
type ThingOutput = {
  readonly '@context'?: 'https://schema.org' | undefined;
  readonly '@id'?: string | undefined;
  readonly '@type'?: string | undefined;

  /**
   * An additional type for the item, typically used for adding more specific types from external vocabularies in microdata syntax. This is a relationship between something and a class that the thing is in. Typically the value is a URI-identified RDF class, and in this case corresponds to the use of rdf:type in RDF. Text values can be used sparingly, for cases where useful information can be added without their being an appropriate schema to reference. In the case of text values, the class label should follow the schema.org [style guide](https://schema.org/docs/styleguide.html).
   *
   * @see https://schema.org/additionalType
   */
  readonly additionalType?: readonly string[] | undefined;

  /**
   * An alias for the item.
   *
   * @see https://schema.org/alternateName
   */
  readonly alternateName?: readonly string[] | undefined;

  /**
   * A description of the item.
   *
   * @see https://schema.org/description
   */
  readonly description?: readonly string[] | undefined;

  /**
   * The name of the item.
   *
   * @see https://schema.org/name
   */
  readonly name?: readonly string[] | undefined;

  /**
   * Indicates a potential Action, which describes an idealized action in which this thing would play an 'object' role.
   *
   * @see https://schema.org/potentialAction
   */
  readonly potentialAction?: readonly ActionOutput[] | undefined;

  /**
   * URL of the item.
   *
   * @see https://schema.org/url
   */
  readonly url?: readonly string[] | undefined;

  /**
   * Indicates an item or CreativeWork that this item, or CreativeWork (in some sense), is part of.
   *
   * @see https://schema.org/isPartOf
   */
  readonly isPartOf?: readonly ThingOutput[] | undefined;
};

/**
 * The most generic type of item.
 *
 * This is partial implementation of https://schema.org/Thing.
 *
 * @see https://schema.org/Thing
 */
const thingSchema: GenericSchema<ThingInput, ThingOutput> =
  // Forward compatibility is the reason why we use looseObject() here and not adhere to JSON-LD which drop unknown fields.
  //
  // Example:
  // - CreativeWork.editor must be type of Person (or any of its subtypes, Patient)
  // - Without looseObject(), when we parse the CreativeWork, we will drop Patient.diagnosis
  // - That means, CreativeWork.editor.diagnosis will be unset despite CreativeWork.editor is of type Patient
  //
  // We can drop looseObject() if there is a way to keep CreativeWork.editor.diagnosis.
  // It is okay to drop future/unsupported properties. But not today/supported properties.
  pipe(
    looseObject({
      '@context': optional(pipe(literal('https://schema.org'))),
      '@id': optional(string()),
      '@type': string(),
      additionalType: orgSchemaProperties(string()),
      alternateName: orgSchemaProperties(string()),
      description: orgSchemaProperties(string()),
      isPartOf: orgSchemaProperties(lazy(() => thingSchema)),
      name: orgSchemaProperties(string()),
      potentialAction: orgSchemaProperties(lazy(() => actionSchema)),
      url: orgSchemaProperties(string())
    }),
    readonly()
  );

export { thingSchema, type ThingInput, type ThingOutput };
