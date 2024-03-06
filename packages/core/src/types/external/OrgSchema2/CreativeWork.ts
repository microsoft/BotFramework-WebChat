import { lazy, parse, string, type ObjectEntries } from 'valibot';

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
  abstract?: string;
  author?: string;
  citation?: readonly CreativeWork[] | undefined;
  keywords?: readonly DefinedTerm[] | undefined;
  pattern?: DefinedTerm | undefined;
  text?: string;
  usageInfo?: CreativeWork | undefined;
};

export const creativeWork = <TEntries extends ObjectEntries>(entries?: TEntries | undefined) =>
  thing({
    /** An abstract is a short description that summarizes a [CreativeWork](https://schema.org/CreativeWork). */
    abstract: orgSchemaProperty(string()),

    /** The author of this content or rating. Please note that author is special in that HTML 5 provides a special mechanism for indicating authorship via the rel tag. That is equivalent to this and may be used interchangeably. */
    author: orgSchemaProperties(string()),

    /** A citation or reference to another creative work, such as another publication, web page, scholarly article, etc. */
    citation: orgSchemaProperties(lazy(() => creativeWork())),

    /** Keywords or tags used to describe some item. Multiple textual entries in a keywords list are typically delimited by commas, or by repeating the property. */
    keywords: orgSchemaProperties(lazy(() => definedTerm())),

    /** A pattern that something has, for example 'polka dot', 'striped', 'Canadian flag'. Values are typically expressed as text, although links to controlled value schemes are also supported. */
    pattern: orgSchemaProperty(lazy(() => definedTerm())),

    /** The textual content of this CreativeWork. */
    text: orgSchemaProperty(string()),

    /**
     * The schema.org [usageInfo](https://schema.org/usageInfo) property indicates further information about a [CreativeWork](https://schema.org/CreativeWork). This property is applicable both to works that are freely available and to those that require payment or other transactions. It can reference additional information, e.g. community expectations on preferred linking and citation conventions, as well as purchasing details. For something that can be commercially licensed, usageInfo can provide detailed, resource-specific information about licensing options.
     *
     * This property can be used alongside the license property which indicates license(s) applicable to some piece of content. The usageInfo property can provide information about other licensing options, e.g. acquiring commercial usage rights for an image that is also available under non-commercial creative commons licenses.
     */
    usageInfo: orgSchemaProperty(lazy(() => creativeWork())),

    ...entries
  });

export const parseCreativeWork = (data: unknown): CreativeWork => parse(creativeWork(), data);
