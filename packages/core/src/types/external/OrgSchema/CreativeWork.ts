import {
  intersect,
  lazy,
  looseObject,
  number,
  parse,
  pipe,
  readonly,
  string,
  union,
  type GenericSchema
} from 'valibot';

import {
  creativeWorkStatusSchema,
  type CreativeWorkStatusInput,
  type CreativeWorkStatusOutput
} from './CreativeWorkStatus';
import { definedTermSchema, type DefinedTermInput, type DefinedTermOutput } from './DefinedTerm';
import { personSchema, type PersonInput, type PersonOutput } from './Person';
import orgSchemaProperties from './private/orgSchemaProperties';
import { thingSchema, type ThingInput, type ThingOutput } from './Thing';

/**
 * The most generic kind of creative work, including books, movies, photographs, software programs, etc.
 *
 * This is partial implementation of https://schema.org/CreativeWork.
 *
 * @see https://schema.org/CreativeWork
 */
type CreativeWorkInput = ThingInput & {
  /**
   * An abstract is a short description that summarizes a [CreativeWork](https://schema.org/CreativeWork).
   *
   * @see https://schema.org/abstract
   */
  readonly abstract?: string | readonly string[] | undefined;

  /**
   * The author of this content or rating. Please note that author is special in that HTML 5 provides a special mechanism for indicating authorship via the rel tag. That is equivalent to this and may be used interchangeably.
   *
   * @see https://schema.org/author
   */
  readonly author?: PersonInput | string | readonly (PersonInput | string)[] | undefined;

  /**
   * A citation or reference to another creative work, such as another publication, web page, scholarly article, etc.
   *
   * @see https://schema.org/citation
   */
  readonly citation?: CreativeWorkInput | readonly CreativeWorkInput[] | undefined;

  /**
   * The status of the creative work, such as whether it is incomplete or published.
   *
   * @see https://schema.org/creativeWorkStatus
   */
  readonly creativeWorkStatus?: CreativeWorkStatusInput | readonly CreativeWorkStatusInput[] | undefined;

  /**
   * The schema.org [isBasedOn](https://schema.org/isBasedOn) property provides a resource from which this work is derived or from which it is a modification or adaptation.
   */
  readonly isBasedOn?: CreativeWorkInput | readonly CreativeWorkInput[] | undefined;

  /**
   * Keywords or tags used to describe some item. Multiple textual entries in a keywords list are typically delimited by commas, or by repeating the property.
   *
   * @see https://schema.org/keywords
   */
  readonly keywords: DefinedTermInput | string | readonly (DefinedTermInput | string)[] | undefined;

  /**
   * A pattern that something has, for example 'polka dot', 'striped', 'Canadian flag'. Values are typically expressed as text, although links to controlled value schemes are also supported.
   *
   * @see https://schema.org/pattern
   */
  readonly pattern: DefinedTermInput | readonly DefinedTermInput[] | undefined;

  /**
   * The position of an item in a series or sequence of items.
   *
   * @see https://schema.org/position
   */
  readonly position: number | string | readonly (number | string)[] | undefined;

  /**
   * The textual content of this CreativeWork.
   *
   * @see https://schema.org/text
   */
  readonly text: string | readonly string[] | undefined;

  /**
   * The schema.org [usageInfo](https://schema.org/usageInfo) property indicates further information about a [CreativeWork](https://schema.org/CreativeWork). This property is applicable both to works that are freely available and to those that require payment or other transactions. It can reference additional information, e.g. community expectations on preferred linking and citation conventions, as well as purchasing details. For something that can be commercially licensed, usageInfo can provide detailed, resource-specific information about licensing options.
   *
   * This property can be used alongside the license property which indicates license(s) applicable to some piece of content. The usageInfo property can provide information about other licensing options, e.g. acquiring commercial usage rights for an image that is also available under non-commercial creative commons licenses.
   */
  readonly usageInfo: CreativeWorkInput | readonly CreativeWorkInput[] | undefined;
};

/**
 * The most generic kind of creative work, including books, movies, photographs, software programs, etc.
 *
 * This is partial implementation of https://schema.org/CreativeWork.
 *
 * @see https://schema.org/CreativeWork
 */
type CreativeWorkOutput = ThingOutput & {
  /**
   * An abstract is a short description that summarizes a [CreativeWork](https://schema.org/CreativeWork).
   *
   * @see https://schema.org/abstract
   */
  readonly abstract?: readonly string[] | undefined;

  /**
   * The author of this content or rating. Please note that author is special in that HTML 5 provides a special mechanism for indicating authorship via the rel tag. That is equivalent to this and may be used interchangeably.
   *
   * @see https://schema.org/author
   */
  readonly author?: readonly (PersonOutput | string)[] | undefined;

  /**
   * A citation or reference to another creative work, such as another publication, web page, scholarly article, etc.
   *
   * @see https://schema.org/citation
   */
  readonly citation?: readonly CreativeWorkOutput[] | undefined;

  /**
   * The status of the creative work, such as whether it is incomplete or published.
   *
   * @see https://schema.org/creativeWorkStatus
   */
  readonly creativeWorkStatus?: readonly CreativeWorkStatusOutput[] | undefined;

  /**
   * The schema.org [isBasedOn](https://schema.org/isBasedOn) property provides a resource from which this work is derived or from which it is a modification or adaptation.
   */
  readonly isBasedOn?: readonly CreativeWorkOutput[] | undefined;

  /**
   * Keywords or tags used to describe some item. Multiple textual entries in a keywords list are typically delimited by commas, or by repeating the property.
   *
   * @see https://schema.org/keywords
   */
  readonly keywords: readonly (DefinedTermOutput | string)[] | undefined;

  /**
   * A pattern that something has, for example 'polka dot', 'striped', 'Canadian flag'. Values are typically expressed as text, although links to controlled value schemes are also supported.
   *
   * @see https://schema.org/pattern
   */
  readonly pattern: readonly DefinedTermOutput[] | undefined;

  /**
   * The position of an item in a series or sequence of items.
   *
   * @see https://schema.org/position
   */
  readonly position: readonly (number | string)[] | undefined;

  /**
   * The textual content of this CreativeWork.
   *
   * @see https://schema.org/text
   */
  readonly text: readonly string[] | undefined;

  /**
   * The schema.org [usageInfo](https://schema.org/usageInfo) property indicates further information about a [CreativeWork](https://schema.org/CreativeWork). This property is applicable both to works that are freely available and to those that require payment or other transactions. It can reference additional information, e.g. community expectations on preferred linking and citation conventions, as well as purchasing details. For something that can be commercially licensed, usageInfo can provide detailed, resource-specific information about licensing options.
   *
   * This property can be used alongside the license property which indicates license(s) applicable to some piece of content. The usageInfo property can provide information about other licensing options, e.g. acquiring commercial usage rights for an image that is also available under non-commercial creative commons licenses.
   */
  readonly usageInfo: readonly CreativeWorkOutput[] | undefined;
};

const creativeWorkSchema: GenericSchema<CreativeWorkInput, CreativeWorkOutput> = intersect([
  thingSchema,
  pipe(
    looseObject({
      // For forward compatibility, we did not enforce @type must be "CreativeWork" or any other subtypes.
      // In future, if Schema.org introduced a new subtype of CreativeWork, we should still able to parse that one as a CreativeWork.

      abstract: orgSchemaProperties(string()),
      author: orgSchemaProperties(union([personSchema, string()])),
      citation: orgSchemaProperties(lazy(() => creativeWorkSchema)),
      creativeWorkStatus: orgSchemaProperties(creativeWorkStatusSchema),
      isBasedOn: orgSchemaProperties(lazy(() => creativeWorkSchema)),
      keywords: orgSchemaProperties(union([lazy(() => definedTermSchema), string()])),
      pattern: orgSchemaProperties(lazy(() => definedTermSchema)),
      position: orgSchemaProperties(union([number(), string()])),
      text: orgSchemaProperties(string()),
      usageInfo: orgSchemaProperties(lazy(() => creativeWorkSchema))
    }),
    readonly()
  )
]);

/** @deprecated Use Valibot.parse(creativeWorkSchema) instead. Will be removed on or after 2028-04-23. */
const parseCreativeWork = (creativeWork: CreativeWorkInput): CreativeWorkOutput =>
  parse(creativeWorkSchema, creativeWork);

export { creativeWorkSchema, parseCreativeWork, type CreativeWorkInput, type CreativeWorkOutput };
