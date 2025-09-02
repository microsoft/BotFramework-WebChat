import { lazy, literal, number, object, parse, string, union, type ObjectEntries } from 'valibot';

import { definedTerm, type DefinedTerm } from './DefinedTerm';
import orgSchemaProperties from './private/orgSchemaProperties';
import orgSchemaProperty from './private/orgSchemaProperty';
import { thing, type Thing } from './Thing';

/**
 * The most generic kind of creative work, including books, movies, photographs, software programs, etc.
 *
 * This is partial implementation of https://schema.org/CreativeWork.
 *
 * @see https://schema.org/CreativeWork
 */
// Due to limitations of TypeScript, when using valibot.lazy(), the output type must be explicitly set.
export type CreativeWork = Thing & {
  /**
   * An abstract is a short description that summarizes a [CreativeWork](https://schema.org/CreativeWork).
   *
   * @see https://schema.org/abstract
   */
  abstract?: string | undefined;

  /**
   * The author of this content or rating. Please note that author is special in that HTML 5 provides a special mechanism for indicating authorship via the rel tag. That is equivalent to this and may be used interchangeably.
   *
   * @see https://schema.org/author
   */
  author?: Person | string | undefined;

  /**
   * A citation or reference to another creative work, such as another publication, web page, scholarly article, etc.
   *
   * @see https://schema.org/citation
   */
  citation?: readonly CreativeWork[] | undefined;

  /**
   * The status of the creative work, such as whether it is incomplete or published.
   *
   * @see https://schema.org/creativeWorkStatus
   */
  creativeWorkStatus?: 'incomplete' | 'published' | undefined;

  /**
   * The schema.org [isBasedOn](https://schema.org/isBasedOn) property provides a resource from which this work is derived or from which it is a modification or adaptation.
   */
  isBasedOn?: CreativeWork | undefined;

  /**
   * Keywords or tags used to describe some item. Multiple textual entries in a keywords list are typically delimited by commas, or by repeating the property.
   *
   * @see https://schema.org/keywords
   */
  keywords?: readonly (DefinedTerm | string)[] | undefined;

  /**
   * A pattern that something has, for example 'polka dot', 'striped', 'Canadian flag'. Values are typically expressed as text, although links to controlled value schemes are also supported.
   *
   * @see https://schema.org/pattern
   */
  pattern?: DefinedTerm | undefined;

  /**
   * The position of an item in a series or sequence of items.
   *
   * @see https://schema.org/position
   */
  position?: number;

  /**
   * The textual content of this CreativeWork.
   *
   * @see https://schema.org/text
   */
  text?: string | undefined;

  /**
   * The schema.org [usageInfo](https://schema.org/usageInfo) property indicates further information about a [CreativeWork](https://schema.org/CreativeWork). This property is applicable both to works that are freely available and to those that require payment or other transactions. It can reference additional information, e.g. community expectations on preferred linking and citation conventions, as well as purchasing details. For something that can be commercially licensed, usageInfo can provide detailed, resource-specific information about licensing options.
   *
   * This property can be used alongside the license property which indicates license(s) applicable to some piece of content. The usageInfo property can provide information about other licensing options, e.g. acquiring commercial usage rights for an image that is also available under non-commercial creative commons licenses.
   */
  usageInfo?: CreativeWork | undefined;
};

type Person = {
  '@type': 'Person';
  description?: string | undefined;
  image?: string | undefined;
  name?: string | undefined;
};

const person = <TEntries extends ObjectEntries>(entries?: TEntries | undefined) =>
  object({
    description: orgSchemaProperty(string()),
    image: orgSchemaProperty(string()),
    name: orgSchemaProperty(string()),

    ...entries
  });

export const creativeWork = <TEntries extends ObjectEntries>(entries?: TEntries | undefined) =>
  thing({
    // For forward compatibility, we did not enforce @type must be "CreativeWork" or any other subtypes.
    // In future, if Schema.org introduced a new subtype of CreativeWork, we should still able to parse that one as a CreativeWork.

    abstract: orgSchemaProperty(string()),
    author: orgSchemaProperty(union([person(), string()])),
    citation: orgSchemaProperties(lazy(() => creativeWork())),
    creativeWorkStatus: orgSchemaProperty(union([literal('incomplete'), literal('published')])),
    isBasedOn: orgSchemaProperty(lazy(() => creativeWork())),
    keywords: orgSchemaProperties(union([lazy(() => definedTerm()), string()])),
    pattern: orgSchemaProperty(lazy(() => definedTerm())),
    position: orgSchemaProperty(number()),
    text: orgSchemaProperty(string()),
    usageInfo: orgSchemaProperty(lazy(() => creativeWork())),

    ...entries
  });

export const parseCreativeWork = (data: unknown): CreativeWork => parse(creativeWork(), data);
