import { intersect, lazy, number, object, parse, string, union, type GenericSchema } from 'valibot';

import { claimSchema } from './Claim';
import {
  creativeWorkStatusSchema,
  type CreativeWorkStatusInput,
  type CreativeWorkStatusOutput
} from './CreativeWorkStatus';
import { definedTermSchema, type DefinedTermInput, type DefinedTermOutput } from './DefinedTerm';
import { jsonLinkedDataEntries } from './JSONLinkedData';
import { personSchema, type PersonInput, type PersonOutput } from './Person';
import jsonLinkedDataProperty from './private/jsonLinkedDataProperty';
import {
  softwareSourceCodeSchema,
  type SoftwareSourceCodeInput,
  type SoftwareSourceCodeOutput
} from './SoftwareSourceCode';
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
  readonly isBasedOn?: SoftwareSourceCodeInput | readonly SoftwareSourceCodeInput[] | undefined;

  /**
   * Indicates an item or CreativeWork that this item, or CreativeWork (in some sense), is part of.
   *
   * @see https://schema.org/isPartOf
   */
  readonly isPartOf?: CreativeWorkInput | readonly CreativeWorkInput[] | undefined;

  /**
   * Keywords or tags used to describe some item. Multiple textual entries in a keywords list are typically delimited by commas, or by repeating the property.
   *
   * @see https://schema.org/keywords
   */
  readonly keywords?: DefinedTermInput | string | readonly (DefinedTermInput | string)[] | undefined;

  /**
   * A pattern that something has, for example 'polka dot', 'striped', 'Canadian flag'. Values are typically expressed as text, although links to controlled value schemes are also supported.
   *
   * @see https://schema.org/pattern
   */
  readonly pattern?: DefinedTermInput | readonly DefinedTermInput[] | undefined;

  /**
   * The position of an item in a series or sequence of items.
   *
   * @see https://schema.org/position
   */
  readonly position?: number | string | readonly (number | string)[] | undefined;

  /**
   * The textual content of this CreativeWork.
   *
   * @see https://schema.org/text
   */
  readonly text?: string | readonly string[] | undefined;

  /**
   * The schema.org [usageInfo](https://schema.org/usageInfo) property indicates further information about a [CreativeWork](https://schema.org/CreativeWork). This property is applicable both to works that are freely available and to those that require payment or other transactions. It can reference additional information, e.g. community expectations on preferred linking and citation conventions, as well as purchasing details. For something that can be commercially licensed, usageInfo can provide detailed, resource-specific information about licensing options.
   *
   * This property can be used alongside the license property which indicates license(s) applicable to some piece of content. The usageInfo property can provide information about other licensing options, e.g. acquiring commercial usage rights for an image that is also available under non-commercial creative commons licenses.
   */
  readonly usageInfo?: CreativeWorkInput | readonly CreativeWorkInput[] | undefined;
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
  readonly abstract: readonly string[];

  /**
   * The author of this content or rating. Please note that author is special in that HTML 5 provides a special mechanism for indicating authorship via the rel tag. That is equivalent to this and may be used interchangeably.
   *
   * @see https://schema.org/author
   */
  readonly author: readonly (PersonOutput | string)[];

  /**
   * A citation or reference to another creative work, such as another publication, web page, scholarly article, etc.
   *
   * @see https://schema.org/citation
   */
  readonly citation: readonly CreativeWorkOutput[];

  /**
   * The status of the creative work, such as whether it is incomplete or published.
   *
   * @see https://schema.org/creativeWorkStatus
   */
  readonly creativeWorkStatus: readonly CreativeWorkStatusOutput[];

  /**
   * The schema.org [isBasedOn](https://schema.org/isBasedOn) property provides a resource from which this work is derived or from which it is a modification or adaptation.
   */
  readonly isBasedOn: readonly SoftwareSourceCodeOutput[];

  /**
   * Indicates an item or CreativeWork that this item, or CreativeWork (in some sense), is part of.
   *
   * @see https://schema.org/isPartOf
   */
  readonly isPartOf: readonly CreativeWorkOutput[];

  /**
   * Keywords or tags used to describe some item. Multiple textual entries in a keywords list are typically delimited by commas, or by repeating the property.
   *
   * @see https://schema.org/keywords
   */
  readonly keywords: readonly (DefinedTermOutput | string)[];

  /**
   * A pattern that something has, for example 'polka dot', 'striped', 'Canadian flag'. Values are typically expressed as text, although links to controlled value schemes are also supported.
   *
   * @see https://schema.org/pattern
   */
  readonly pattern: readonly DefinedTermOutput[];

  /**
   * The position of an item in a series or sequence of items.
   *
   * @see https://schema.org/position
   */
  readonly position: readonly (number | string)[];

  /**
   * The textual content of this CreativeWork.
   *
   * @see https://schema.org/text
   */
  readonly text: readonly string[];

  /**
   * The schema.org [usageInfo](https://schema.org/usageInfo) property indicates further information about a [CreativeWork](https://schema.org/CreativeWork). This property is applicable both to works that are freely available and to those that require payment or other transactions. It can reference additional information, e.g. community expectations on preferred linking and citation conventions, as well as purchasing details. For something that can be commercially licensed, usageInfo can provide detailed, resource-specific information about licensing options.
   *
   * This property can be used alongside the license property which indicates license(s) applicable to some piece of content. The usageInfo property can provide information about other licensing options, e.g. acquiring commercial usage rights for an image that is also available under non-commercial creative commons licenses.
   */
  readonly usageInfo: readonly CreativeWorkOutput[];
};

// Cyclic dependency.
// eslint-disable-next-line prefer-const
let creativeWorkSchema_: GenericSchema<CreativeWorkInput, CreativeWorkOutput>;

const creativeWorkEntries = {
  ...jsonLinkedDataEntries,
  abstract: jsonLinkedDataProperty(string()),
  author: jsonLinkedDataProperty(union([lazy(() => personSchema), string()])),
  citation: jsonLinkedDataProperty(lazy(() => claimSchema)),
  creativeWorkStatus: jsonLinkedDataProperty(creativeWorkStatusSchema),
  isBasedOn: jsonLinkedDataProperty(lazy(() => softwareSourceCodeSchema)),
  isPartOf: jsonLinkedDataProperty(lazy(() => creativeWorkSchema_)),
  keywords: jsonLinkedDataProperty(union([lazy(() => definedTermSchema), string()])),
  pattern: jsonLinkedDataProperty(lazy(() => definedTermSchema)),
  position: jsonLinkedDataProperty(union([number(), string()])),
  text: jsonLinkedDataProperty(string()),
  usageInfo: jsonLinkedDataProperty(lazy(() => creativeWorkSchema_))
};

creativeWorkSchema_ = intersect([
  lazy(() => thingSchema),
  object(creativeWorkEntries)
  // objectWithRest(creativeWorkEntries, jsonLinkedDataProperty(any(), 'CREATIVE WORK'))
]);

// Constantize here, so we are exporting a const than a let.
const creativeWorkSchema = creativeWorkSchema_;

/** @deprecated Use Valibot.parse(creativeWorkSchema) instead. Will be removed on or after 2028-04-23. */
const parseCreativeWork = (creativeWork: CreativeWorkInput): CreativeWorkOutput =>
  parse(creativeWorkSchema_, creativeWork);

export { creativeWorkEntries, creativeWorkSchema, parseCreativeWork, type CreativeWorkInput, type CreativeWorkOutput };
