import { lazy, literal, object, optional, parse, pipe, readonly, string, type GenericSchema } from 'valibot';

import { actionSchema, type ActionInput, type ActionOutput } from './Action';
import orgSchemaProperties from './private/orgSchemaProperties';

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

/**
 * The most generic type of item.
 *
 * This is partial implementation of https://schema.org/Thing.
 *
 * @see https://schema.org/Thing
 */
const thingSchema: GenericSchema<ThingInput, ThingOutput> =
  // We cannot use looseObject() to futureproof properties.

  // The following code will result in error:

  // parse(
  //   intersect([
  //     looseObject({ one: number() }),
  //     looseObject({
  //       two: pipe(
  //         number(),
  //         transform(value => '' + value)
  //       )
  //     })
  //   ]),
  //   {
  //     one: 1,
  //     two: 2
  //   }
  // );

  // {
  //   kind: 'schema',
  //   type: 'intersect',
  //   input: {
  //     one: 1,
  //     two: 2
  //   },
  //   expected: 'Object',
  //   received: 'unknown',
  //   message: 'Invalid type: Expected Object but received unknown'
  // };

  // This is due to how intersect works.
  // Intersection kicks-in after both looseObject() is done.
  // When trying to intersect { one: 1, two: 2 } and { one: 1, two: '2' }, it would fail.

  // In our code, we are literally doing `intersect(lazy(() => looseObject({})), looseObject({}))`.

  // We cannot use object().entries because we need to use lazy() which requires GenericSchema.
  // We could write out the GenericSchema as ObjectSchema but it will be very cumbersome.
  // At the end of the day, it is easier to keep object() than looseObject().

  pipe(
    object({
      '@context': optional(pipe(literal('https://schema.org'))),
      '@id': optional(string()),
      '@type': optional(string()),
      additionalType: orgSchemaProperties(string()),
      alternateName: orgSchemaProperties(string()),
      description: orgSchemaProperties(string()),
      name: orgSchemaProperties(string()),
      potentialAction: orgSchemaProperties(lazy(() => actionSchema)),
      url: orgSchemaProperties(string())
    }),
    readonly()
  );

/** @deprecated Use Valibot.parse(thingSchema) instead. Will be removed on or after 2028-04-23. */
const parseThing = (thing: ThingInput): ThingOutput => parse(thingSchema, thing);

export { parseThing, thingSchema, type ThingInput, type ThingOutput };
